"""
Tests for provider-independent safety guarantees and LLM provider behaviour.

Covers:
  * CPCB boundary handling in safety cautions (AQI 200/201, 300/301, 400/401)
  * enforce_plan_guardrails() always adds the mandatory cautions and disclaimer
  * /api/plan always contains the asthma caution, even if the provider omits it
  * Gemini provider: API key sent in a header (not the URL), LLM impact figures are
    ignored in favour of the deterministic engine, and failures fall back safely
"""

import asyncio
import copy
import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app
from app.models.schemas import HouseholdMember, HouseholdProfile
from app.services.llm.demo_llm import DemoLLMProvider
from app.services.llm.gemini import GeminiLLMProvider
from app.services.safety import STANDARD_DISCLAIMER, enforce_plan_guardrails, get_safety_cautions

POOR = "Poor air quality:"
VERY_POOR = "Very Poor air today"
SEVERE = "CRITICAL"

AQI_DATA = {
    "current": {"aqi": 150, "category": "Moderate", "pm2_5": 60.0},
    "safe_windows": [],
}

ASTHMA_HOUSEHOLD = HouseholdProfile(members=[HouseholdMember(role="adult", age=30, sensitivities=["asthma"])])


def _has(cautions, fragment):
    return any(fragment in c for c in cautions)


# ---------------------------------------------------------------------------
# CPCB boundary handling
# ---------------------------------------------------------------------------
@pytest.mark.parametrize(
    "aqi, expected",
    [
        (200, []),  # 200 is still Moderate (101-200)
        (201, [POOR]),  # 201 is Poor
        (300, [POOR]),  # 300 is still Poor (201-300)
        (301, [VERY_POOR]),  # 301 is Very Poor
        (400, [VERY_POOR]),  # 400 is still Very Poor (301-400)
        (401, [SEVERE]),  # 401 is Severe
    ],
)
def test_caution_tiers_follow_cpcb_band_boundaries(aqi, expected):
    cautions = get_safety_cautions(aqi=aqi, category="", household=None)
    for fragment in (POOR, VERY_POOR, SEVERE):
        assert _has(cautions, fragment) == (fragment in expected), f"AQI {aqi}: unexpected tier for {fragment!r}"


# ---------------------------------------------------------------------------
# enforce_plan_guardrails
# ---------------------------------------------------------------------------
def test_enforce_guardrails_adds_asthma_caution_and_disclaimer():
    plan = {"cautions": [], "disclaimer": ""}
    result = enforce_plan_guardrails(plan, aqi=40, category="Good", household=ASTHMA_HOUSEHOLD)
    assert _has(result["cautions"], "inhalers")
    assert result["disclaimer"] == STANDARD_DISCLAIMER


def test_enforce_guardrails_keeps_provider_cautions_without_duplicates():
    mandatory = get_safety_cautions(40, "Good", ASTHMA_HOUSEHOLD)
    plan = {"cautions": ["Provider note", mandatory[0]], "disclaimer": "Custom disclaimer"}
    result = enforce_plan_guardrails(plan, aqi=40, category="Good", household=ASTHMA_HOUSEHOLD)
    assert result["cautions"].count(mandatory[0]) == 1
    assert "Provider note" in result["cautions"]
    assert result["disclaimer"] == "Custom disclaimer"


# ---------------------------------------------------------------------------
# /api/plan route
# ---------------------------------------------------------------------------
class _SilentProvider:
    """A provider that returns a valid plan with NO cautions and NO disclaimer."""

    async def generate_plan(self, city, aqi_data, household, rag_context, language="en"):
        return {
            "summary": "stub",
            "risk_level": "moderate",
            "sections": {},
            "today_timeline": [],
            "impact_summary": {
                "exposure_reduction_pct": 1.0,
                "co2_avoided_kg_week": 1.0,
                "cost_saved_inr_month": 1.0,
            },
            "cautions": [],
            "disclaimer": "",
        }


def test_plan_route_always_includes_asthma_caution(monkeypatch):
    async def fake_aqi(city):
        return AQI_DATA

    monkeypatch.setattr("app.routers.plan.fetch_air_quality", fake_aqi)
    monkeypatch.setattr("app.routers.plan.get_llm_provider", lambda: _SilentProvider())

    body = {
        "city": "Delhi",
        "language": "en",
        "household": ASTHMA_HOUSEHOLD.model_dump(),
    }
    response = TestClient(app).post("/api/plan", json=body)
    assert response.status_code == 200
    data = response.json()
    assert _has(data["cautions"], "inhalers")
    assert data["disclaimer"] == STANDARD_DISCLAIMER


# ---------------------------------------------------------------------------
# Gemini provider
# ---------------------------------------------------------------------------
def _demo_plan():
    return asyncio.run(DemoLLMProvider().generate_plan("Delhi", AQI_DATA, None, [], "en"))


class _FakeResponse:
    def __init__(self, payload, status_code=200):
        self._payload = payload
        self.status_code = status_code

    def json(self):
        return self._payload


def _gemini_payload(plan):
    return {"candidates": [{"content": {"parts": [{"text": json.dumps(plan)}]}}]}


@pytest.fixture
def gemini(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    return GeminiLLMProvider()


def test_gemini_sends_key_in_header_not_url(monkeypatch, gemini):
    seen = {}
    payload = _gemini_payload(_demo_plan())  # built before the event loop starts

    async def fake_post(self, url, **kwargs):
        seen["url"] = url
        seen["headers"] = kwargs.get("headers", {})
        return _FakeResponse(payload)

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    asyncio.run(gemini.generate_plan("Delhi", AQI_DATA, None, [], "en"))

    assert "key=" not in seen["url"]
    assert "test-key" not in seen["url"]
    assert seen["headers"]["x-goog-api-key"] == "test-key"


def test_gemini_plan_impact_numbers_always_come_from_engine(monkeypatch, gemini):
    expected = _demo_plan()["impact_summary"]
    bogus = copy.deepcopy(_demo_plan())
    bogus["impact_summary"] = {
        "exposure_reduction_pct": 99.0,
        "co2_avoided_kg_week": 999.0,
        "cost_saved_inr_month": 999999.0,
    }

    async def fake_post(self, url, **kwargs):
        return _FakeResponse(_gemini_payload(bogus))

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    result = asyncio.run(gemini.generate_plan("Delhi", AQI_DATA, None, [], "en"))

    assert result["impact_summary"] == expected
    assert result["impact_summary"]["exposure_reduction_pct"] != 99.0


def test_gemini_falls_back_to_rule_based_plan_on_network_error(monkeypatch, gemini):
    async def failing_post(self, url, **kwargs):
        raise httpx.ConnectError("network down")

    monkeypatch.setattr(httpx.AsyncClient, "post", failing_post)
    result = asyncio.run(gemini.generate_plan("Delhi", AQI_DATA, None, [], "en"))
    assert result == _demo_plan()


def test_gemini_falls_back_on_malformed_model_output(monkeypatch, gemini):
    async def bad_post(self, url, **kwargs):
        return _FakeResponse(_gemini_payload({"summary": "missing required fields"}))

    monkeypatch.setattr(httpx.AsyncClient, "post", bad_post)
    result = asyncio.run(gemini.generate_plan("Delhi", AQI_DATA, None, [], "en"))
    assert result == _demo_plan()


def test_gemini_without_key_uses_rule_based_plan(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")
    result = asyncio.run(GeminiLLMProvider().generate_plan("Delhi", AQI_DATA, None, [], "en"))
    assert result == _demo_plan()
