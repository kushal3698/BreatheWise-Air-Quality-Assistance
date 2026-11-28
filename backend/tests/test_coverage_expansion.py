import json
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from app.config import settings
from app.models.schemas import HomeProfile, HouseholdMember, HouseholdProfile, TransportProfile
from app.services.air_quality import (
    _CACHE,
    _assemble_live_payload,
    _build_hourly_forecast,
    fetch_air_quality,
    load_demo_aqi,
)
from app.services.geocoding import geocode_city
from app.services.impact import calculate_action_impact, calculate_overall_impact
from app.services.llm.demo_llm import (
    DemoLLMProvider,
    _build_diurnal_timeline,
    _build_indoor_air_hacks,
    _build_low_emission_routines,
    _build_multilingual_summary,
    _build_sustainable_alternatives,
    _compute_diurnal_bounds,
    _detect_household_sensitivities,
    _dispatch_chat_topic,
    _localize_chat_reply,
)
from app.services.llm.openai_compat import OpenAICompatLLMProvider


# ============================================================================
# DemoLLMProvider Unit Tests
# ============================================================================
def test_detect_household_sensitivities():
    # None household
    has_asthma, has_purifier = _detect_household_sensitivities(None)
    assert not has_asthma and not has_purifier

    # Empty household
    empty_hh = HouseholdProfile()
    has_asthma, has_purifier = _detect_household_sensitivities(empty_hh)
    assert not has_asthma and not has_purifier

    # Household with COPD and purifier
    hh = HouseholdProfile(
        members=[HouseholdMember(role="elder", age=70, sensitivities=["COPD history"])],
        home=HomeProfile(has_purifier=True),
    )
    has_asthma, has_purifier = _detect_household_sensitivities(hh)
    assert has_asthma is True
    assert has_purifier is True


def test_compute_diurnal_bounds():
    # Empty safe windows
    text, safe_aqi, morning, evening = _compute_diurnal_bounds(200, [])
    assert text == "13:00 - 16:30"
    assert safe_aqi == round(200 * 0.72)
    assert morning == round(200 * 1.30)
    assert evening == round(200 * 1.20)

    # Provided safe windows
    windows = [{"start": "12:00", "end": "15:00", "avg_aqi": 110}]
    text, safe_aqi, morning, evening = _compute_diurnal_bounds(200, windows)
    assert text == "12:00 - 15:00"
    assert safe_aqi == 110


def test_build_multilingual_summary():
    # Languages: hi, te, ta
    s_hi = _build_multilingual_summary("Delhi", "Poor", 250, 325, "13:00 - 16:00", "hi", False)
    assert "Delhi" in s_hi and "वायु गुणवत्ता" in s_hi

    s_te = _build_multilingual_summary("Delhi", "Poor", 250, 325, "13:00 - 16:00", "te", False)
    assert "Delhi" in s_te and "గాలి నాణ్యత" in s_te

    s_ta = _build_multilingual_summary("Delhi", "Poor", 250, 325, "13:00 - 16:00", "ta", False)
    assert "Delhi" in s_ta and "காற்றின் தரம்" in s_ta

    # English with asthma
    s_en_asthma = _build_multilingual_summary("Delhi", "Very Poor", 350, 455, "13:00 - 16:00", "en", True)
    assert "Asthma caution" in s_en_asthma

    # English AQI > 200 without asthma
    s_en_elevated = _build_multilingual_summary("Delhi", "Poor", 250, 325, "13:00 - 16:00", "en", False)
    assert "Elevated Poor pollution" in s_en_elevated

    # English AQI 150 without asthma
    s_en_mod = _build_multilingual_summary("Delhi", "Moderate", 150, 195, "13:00 - 16:00", "en", False)
    assert "Moderate air quality in Delhi" in s_en_mod

    # English AQI 45
    s_en_good = _build_multilingual_summary("Delhi", "Good", 45, 58, "13:00 - 16:00", "en", False)
    assert "Favorable conditions" in s_en_good


def test_build_low_emission_routines():
    # Metro
    routines_metro = _build_low_emission_routines("13:00 - 16:00", 380, True, 180.0, None)
    assert len(routines_metro) >= 2
    actions = [r["action"] for r in routines_metro]
    assert any("Metro" in a for a in actions)

    # Non-metro
    routines_non_metro = _build_low_emission_routines("13:00 - 16:00", 150, False, 50.0, None)
    assert len(routines_non_metro) >= 2
    actions_nm = [r["action"] for r in routines_non_metro]
    assert any("shared transit" in a or "bus" in a for a in actions_nm)


def test_build_indoor_air_hacks():
    # Has purifier
    hacks_p = _build_indoor_air_hacks("13:00 - 16:00", 120, True, 150.0, None)
    assert any("Run bedroom HEPA" in h["action"] for h in hacks_p)

    # No purifier
    hacks_np = _build_indoor_air_hacks("13:00 - 16:00", 120, False, 150.0, None)
    assert any("Corsi-Rosenthal" in h["action"] for h in hacks_np)


def test_build_sustainable_alternatives():
    alts = _build_sustainable_alternatives(150.0, None)
    assert len(alts) >= 2
    actions = [a["action"] for a in alts]
    assert any("grocery" in a.lower() or "errand" in a.lower() for a in actions)


def test_build_diurnal_timeline():
    timeline = _build_diurnal_timeline("13:00 - 16:00", 150, 320, 260)
    assert len(timeline) == 4
    times = [item["time"] for item in timeline]
    assert "06:00 - 09:30" in times
    assert "13:00 - 16:00" in times


def test_dispatch_chat_topic_variations():
    curr = {"pm2_5": 178.4, "pm10": 288.0}

    # Child / play outside
    rep_child, sugg_child = _dispatch_chat_topic(
        "Can my 8-year-old child play outside?", "Delhi", "Very Poor", 345, curr, "13:00 - 16:00"
    )
    assert "Do not allow your child to play vigorously" in rep_child
    assert len(sugg_child) > 0

    # Commute / travel
    rep_commute, sugg_commute = _dispatch_chat_topic(
        "best way to commute?", "Delhi", "Very Poor", 345, curr, "13:00 - 16:00"
    )
    assert "Metro" in rep_commute

    # Purifier / DIY / Corsi
    rep_purifier, sugg_purifier = _dispatch_chat_topic(
        "should I get a purifier or make a corsi rosenthal box?", "Delhi", "Very Poor", 345, curr, "13:00 - 16:00"
    )
    assert "Corsi-Rosenthal" in rep_purifier

    # 3-day plan
    rep_plan, sugg_plan = _dispatch_chat_topic("give me a 3-day plan", "Delhi", "Very Poor", 345, curr, "13:00 - 16:00")
    assert "Day 1" in rep_plan and "Day 2" in rep_plan

    # Generic
    rep_gen, sugg_gen = _dispatch_chat_topic("hello there", "Delhi", "Very Poor", 345, curr, "13:00 - 16:00")
    assert "N95 respirators" in rep_gen


def test_localize_chat_reply():
    raw = "Keep windows closed during morning hours."
    rep_hi = _localize_chat_reply(raw, "hi", "Delhi", "Poor", 220)
    assert "Delhi" in rep_hi and "वायु गुणवत्ता" in rep_hi

    rep_te = _localize_chat_reply(raw, "te", "Delhi", "Poor", 220)
    assert "Delhi" in rep_te and "గాలి నాణ్యత" in rep_te

    rep_ta = _localize_chat_reply(raw, "ta", "Delhi", "Poor", 220)
    assert "Delhi" in rep_ta and "காற்றின் தரம்" in rep_ta

    rep_en = _localize_chat_reply(raw, "en", "Delhi", "Poor", 220)
    assert rep_en == raw


@pytest.mark.anyio
async def test_demo_llm_generate_chat_reply():
    demo = DemoLLMProvider()
    aqi_data = {"current": {"aqi": 210, "category": "Poor"}}
    hh = HouseholdProfile(members=[HouseholdMember(role="child", age=6, sensitivities=["asthma"])])

    # Chat with history
    history = [{"role": "user", "content": "hello"}, {"role": "assistant", "content": "hi"}]
    reply = await demo.generate_chat_reply(
        message="Should I buy an air purifier?",
        city="Delhi",
        aqi_data=aqi_data,
        household=hh,
        rag_context=[],
        language="en",
        history=history,
    )
    assert "reply" in reply
    assert "grounded_sources" in reply
    assert len(reply["reply"]) > 0


# ============================================================================
# OpenAICompatLLMProvider Unit Tests
# ============================================================================
@pytest.mark.anyio
async def test_openai_compat_without_credentials(monkeypatch):
    monkeypatch.setattr(settings, "openai_compat_api_key", None)
    monkeypatch.setattr(settings, "openai_compat_base_url", None)
    provider = OpenAICompatLLMProvider()

    aqi_data = {"current": {"aqi": 120, "category": "Moderate"}}
    plan = await provider.generate_plan("Delhi", aqi_data, None, [], "en")
    assert "summary" in plan
    assert "impact_summary" in plan

    chat = await provider.generate_chat_reply("mask?", "Delhi", aqi_data, None, [], "en")
    assert "reply" in chat


@pytest.mark.anyio
async def test_openai_compat_with_mock_success(monkeypatch):
    monkeypatch.setattr(settings, "openai_compat_api_key", "mock-key")
    monkeypatch.setattr(settings, "openai_compat_base_url", "https://api.mockllm.com/v1")
    monkeypatch.setattr(settings, "openai_compat_model", "mock-model")

    mock_llm_json = {
        "summary": "AI generated summary.",
        "risk_level": "moderate",
        "sections": {
            "low_emission_routines": [
                {
                    "action": "Metro commute",
                    "why": "Avoid vehicular emissions",
                    "effort": "low",
                    "cost": "low",
                    "impact": {"exposure_reduction_pct": 99.0, "confidence": "high"},
                    "sources": [],
                }
            ],
            "indoor_air_hacks": [],
            "sustainable_alternatives": [],
        },
        "today_timeline": [{"time": "13:00-16:00", "advice": "Ventilate"}],
        "impact_summary": {"exposure_reduction_pct": 999.0},  # Must be overwritten by deterministic engine!
        "cautions": [],
        "disclaimer": "Standard disclaimer",
    }

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"choices": [{"message": {"content": json.dumps(mock_llm_json)}}]}

    provider = OpenAICompatLLMProvider()
    aqi_data = {"current": {"aqi": 180, "category": "Moderate"}}

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        plan = await provider.generate_plan("Delhi", aqi_data, None, [], "en")
        assert plan["summary"] == "AI generated summary."
        # Verify the LLM's hallucinated 999.0 impact is replaced by deterministic calculations:
        assert plan["impact_summary"]["exposure_reduction_pct"] != 999.0


@pytest.mark.anyio
async def test_openai_compat_error_fallback(monkeypatch):
    monkeypatch.setattr(settings, "openai_compat_api_key", "mock-key")
    monkeypatch.setattr(settings, "openai_compat_base_url", "https://api.mockllm.com/v1")
    provider = OpenAICompatLLMProvider()

    aqi_data = {"current": {"aqi": 180, "category": "Moderate"}}

    # HTTP 500 error
    mock_err_resp = MagicMock()
    mock_err_resp.status_code = 500

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_err_resp
        plan = await provider.generate_plan("Delhi", aqi_data, None, [], "en")
        assert "summary" in plan

    # Network Exception
    with patch("httpx.AsyncClient.post", side_effect=httpx.ConnectError("Connection refused")):
        plan = await provider.generate_plan("Delhi", aqi_data, None, [], "en")
        assert "summary" in plan


# ============================================================================
# Air Quality & Geocoding Edge Cases
# ============================================================================
def test_build_hourly_forecast():
    # Empty hourly dictionary
    res_empty = _build_hourly_forecast({}, default_pm25=40.0, default_pm10=80.0)
    assert res_empty == []

    # Valid times with some nulls and secondary gaseous pollutants (O3 dominant in afternoon)
    hourly_mock = {
        "time": ["2026-11-27T00:00", "2026-11-27T02:00", "2026-11-27T04:00"],
        "pm2_5": [50.0, None, 20.0],
        "pm10": [100.0, 120.0, 40.0],
        "nitrogen_dioxide": [30.0, 35.0, 45.0],
        "sulphur_dioxide": [8.0, 10.0, 12.0],
        "carbon_monoxide": [900.0, 1000.0, 1100.0],
        "ozone": [25.0, 30.0, 168.0],  # 168 ug/m3 O3 -> CPCB sub-index 200 (dominates PM2.5=20)
    }
    res = _build_hourly_forecast(hourly_mock, default_pm25=30.0, default_pm10=60.0)
    assert len(res) == 2  # Step of 2 across 3 elements => index 0 and 2
    assert res[0]["hour"] == "00:00"
    assert res[1]["hour"] == "04:00"
    assert res[1]["aqi"] == 200  # Multi-pollutant sub-index picks ozone=200 over pm2.5=33


def test_assemble_live_payload():
    loc = {"name": "Delhi", "lat": 28.6139, "lon": 77.2090}
    aq_data = {
        "current": {
            "pm2_5": 120.0,
            "pm10": 200.0,
            "nitrogen_dioxide": 40.0,
            "sulphur_dioxide": 15.0,
            "carbon_monoxide": 1500.0,
            "ozone": 30.0,
        },
        "hourly": {"time": [], "pm2_5": [], "pm10": []},
    }
    w_data = {
        "current": {
            "temperature_2m": 22.5,
            "relative_humidity_2m": 65,
            "wind_speed_10m": 12.0,
        }
    }
    payload = _assemble_live_payload(loc, aq_data, w_data)
    assert payload["location"]["name"] == "Delhi"
    assert payload["current"]["co"] == 1.5  # 1500 / 1000
    assert payload["weather"]["temp_c"] == 22.5
    assert payload["weather"]["humidity"] == 65
    assert "forecast" in payload


def test_load_demo_aqi():
    loc_delhi = {"name": "Delhi", "lat": 28.6139, "lon": 77.2090}
    data_delhi = load_demo_aqi("Delhi", loc_delhi)
    assert data_delhi["current"]["aqi"] == 345

    loc_guntur = {"name": "Guntur", "lat": 16.3067, "lon": 80.4365}
    data_guntur = load_demo_aqi("Guntur", loc_guntur)
    assert data_guntur["current"]["aqi"] == 118

    loc_other = {"name": "Varanasi", "lat": 25.3176, "lon": 82.9739}
    data_other = load_demo_aqi("Varanasi", loc_other)
    assert data_other["current"]["aqi"] > 0


@pytest.mark.anyio
async def test_fetch_air_quality_cache_and_demo(monkeypatch):
    monkeypatch.setattr(settings, "demo_mode", True)
    res = await fetch_air_quality("Delhi")
    assert res["current"]["aqi"] == 345

    # Check cache behavior
    _CACHE.clear()
    monkeypatch.setattr(settings, "demo_mode", False)
    # Mocking open-meteo raw return
    mock_aq = {"current": {"pm2_5": 60.0, "pm10": 110.0}, "hourly": {}}
    mock_w = {"current": {"temperature_2m": 25.0, "relative_humidity_2m": 50, "wind_speed_10m": 10.0}}

    with patch("app.services.open_meteo_client._fetch_open_meteo_raw", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = (mock_aq, mock_w)
        first_call = await fetch_air_quality("Pune")
        assert first_call["location"]["name"] == "Pune"
        # Second call should hit memory cache
        second_call = await fetch_air_quality("Pune")
        assert second_call["location"]["name"] == "Pune"
        assert mock_fetch.call_count == 1


@pytest.mark.anyio
async def test_geocoding_open_meteo_fallback():
    mock_api_resp = MagicMock()
    mock_api_resp.status_code = 200
    mock_api_resp.json.return_value = {
        "results": [
            {"name": "Zurich", "admin1": "Zurich", "country": "Switzerland", "latitude": 47.3769, "longitude": 8.5417}
        ]
    }

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_api_resp
        loc = await geocode_city("Zurich")
        assert loc["name"] == "Zurich"
        assert loc["lat"] == pytest.approx(47.3769, abs=0.01)

    # API failure fallback
    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectError("Timeout")):
        loc_fallback = await geocode_city("AtlantisCityUnknown")
        assert "lat" in loc_fallback
        assert "lon" in loc_fallback


# ============================================================================
# Impact Service Unit Tests
# ============================================================================
def test_calculate_action_impact():
    # Exercise
    imp_ex_high = calculate_action_impact("exercise", outdoor_pm25=180.0)
    assert imp_ex_high["exposure_reduction_pct"] == 65.0

    imp_ex_low = calculate_action_impact("exercise", outdoor_pm25=50.0)
    assert imp_ex_low["exposure_reduction_pct"] == 40.0

    # Commute
    hh = HouseholdProfile(
        transport=TransportProfile(mode="petrol_car", commute_km=20.0),
    )
    imp_commute = calculate_action_impact("commute", outdoor_pm25=180.0, household=hh)
    assert imp_commute["exposure_reduction_pct"] == 35.0
    assert imp_commute["co2_saved_kg"] > 0

    # School
    imp_school = calculate_action_impact("school", outdoor_pm25=180.0, household=hh)
    assert imp_school["exposure_reduction_pct"] == 20.0

    # Purifier
    imp_purifier = calculate_action_impact("purifier", outdoor_pm25=180.0)
    assert imp_purifier["exposure_reduction_pct"] == 75.0

    # Cooking
    imp_cooking = calculate_action_impact("cooking", outdoor_pm25=180.0)
    assert imp_cooking["exposure_reduction_pct"] == 25.0

    # Default
    imp_default = calculate_action_impact("other", outdoor_pm25=180.0)
    assert imp_default["exposure_reduction_pct"] == 15.0


def test_calculate_overall_impact():
    hh = HouseholdProfile(
        transport=TransportProfile(mode="petrol_car", commute_km=20.0),
        home=HomeProfile(has_purifier=False),
        work_from_home_days=2,
    )
    overall = calculate_overall_impact(outdoor_pm25=180.0, household=hh)
    assert overall.exposure_reduction_pct > 0
    assert overall.co2_avoided_kg_week > 0
    assert overall.cost_saved_inr_month > 0
    assert overall.cigarettes_avoided_day > 0
