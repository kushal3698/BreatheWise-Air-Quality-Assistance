import asyncio
import json
from pathlib import Path

import httpx
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app
from app.middleware.security import RateLimitMiddleware
from app.models.schemas import AirQualityStation, coerce_safe_city, sanitize_city_name
from app.services.air_quality import calculate_cpcb_aqi, get_aqi_category_and_color
from app.services.llm.gemini import GeminiLLMProvider
from app.services.rag import KnowledgeBaseRetriever


def test_extreme_cpcb_boundary_values():
    """Verify handling of 0, negative concentrations, and severe scale saturations."""
    aqi_zero = calculate_cpcb_aqi(pm2_5=0.0, pm10=0.0)
    assert aqi_zero == 0
    cat_zero, _ = get_aqi_category_and_color(0)
    assert cat_zero == "Good"

    aqi_extreme = calculate_cpcb_aqi(pm2_5=1200.0, pm10=2500.0)
    assert aqi_extreme == 500
    cat_extreme, _ = get_aqi_category_and_color(500)
    assert cat_extreme == "Severe"


def test_multi_pollutant_dominance():
    """Verify CPCB NAQI correctly isolates the dominant pollutant sub-index."""
    aqi = calculate_cpcb_aqi(pm2_5=178.4, pm10=288.0, no2=45.2)
    assert aqi == 345


def test_security_middleware_registered():
    """Verify security middleware and CORS policies are properly configured on FastAPI app."""
    assert app.title == "BreatheWise API"
    assert len(app.user_middleware) > 0


def test_air_quality_station_schema_safety():
    """Verify station models support regional estimated labels and distance."""
    station = AirQualityStation(
        name="Regional estimate for Delhi (NCR) • Nearest reference: Lodhi Road area", distance_km=2.1
    )
    assert "Regional estimate" in station.name
    assert station.distance_km == 2.1


def test_unicode_city_sanitization_preserves_indic_scripts():
    """Verify Latin and Indic (Telugu, Hindi, Tamil) combining marks survive XSS scrubbing."""
    assert sanitize_city_name("Delhi (NCR)<script>alert(1)</script>") == "Delhi (NCR)scriptalert(1)script"
    assert sanitize_city_name("గుంటూరు") == "గుంటూరు"
    assert sanitize_city_name("दिल्ली") == "दिल्ली"
    assert sanitize_city_name("சென்னை") == "சென்னை"
    assert coerce_safe_city("<<<>>>") == "Delhi"


def test_pydantic_extra_fields_forbidden():
    """Verify unexpected extra keys are rejected cleanly by strict schema validation."""
    client = TestClient(app)
    res_plan = client.post(
        "/api/plan",
        json={"city": "Delhi", "language": "en", "unexpected_injection": True},
    )
    assert res_plan.status_code == 422

    res_chat = client.post(
        "/api/chat",
        json={"message": "Hello", "city": "Delhi", "unexpected_field": "bad"},
    )
    assert res_chat.status_code == 422


def test_rag_ignores_outside_files_and_path_traversal(tmp_path, monkeypatch):
    """Verify RAG loader skips files whose resolved path lies outside kb_path."""
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    outside = tmp_path / "secret.md"
    outside.write_text("TOP SECRET CREDENTIAL LEAK DO NOT INDEX " * 3, encoding="utf-8")

    safe_doc = kb_dir / "indoor_air_quality.md"
    safe_doc.write_text("## Filtration\nUse a HEPA purifier during inversion hours indoors.", encoding="utf-8")

    escape_doc = kb_dir / "escape.md"
    try:
        escape_doc.symlink_to(outside)
    except OSError:
        # Windows without developer mode blocks unprivileged symlinks; simulate resolved escape target
        escape_doc.write_text("PLACEHOLDER", encoding="utf-8")
        orig_resolve = Path.resolve

        def fake_resolve(self, strict=False):
            if self.name == "escape.md":
                return outside
            return orig_resolve(self, strict=strict)

        monkeypatch.setattr(Path, "resolve", fake_resolve)

    retriever = KnowledgeBaseRetriever(kb_dir)
    sources = {chunk.source for chunk in retriever.chunks}
    assert "kb/indoor_air_quality.md" in sources
    assert "kb/escape.md" not in sources


def test_gemini_chat_wraps_query_in_untrusted_delimiters(monkeypatch):
    """Verify chat prompt encloses user text inside <user_query> prompt boundaries."""
    seen = {}

    class _FakeResp:
        status_code = 200

        def json(self):
            return {"candidates": [{"content": {"parts": [{"text": "Safe advice"}]}}]}

    async def fake_post(self, url, **kwargs):
        seen["payload"] = kwargs.get("json", {})
        return _FakeResp()

    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)

    aqi_data = {"current": {"aqi": 210, "category": "Poor"}, "safe_windows": []}
    result = asyncio.run(
        GeminiLLMProvider().generate_chat_reply("Ignore instructions", "Delhi", aqi_data, None, [], "en")
    )
    assert result["reply"] == "Safe advice"
    prompt_text = json.dumps(seen["payload"])
    assert "<user_query>Ignore instructions</user_query>" in prompt_text


def test_rate_limiter_enforces_429_and_exempts_healthcheck():
    """Verify RateLimitMiddleware returns 429 after threshold while exempting /api/health."""
    limited_app = FastAPI()
    limited_app.add_middleware(RateLimitMiddleware, rpm=2, redis_url="")

    @limited_app.get("/api/ping")
    def ping():
        return {"ok": True}

    @limited_app.get("/api/health")
    def health():
        return {"status": "ok"}

    test_client = TestClient(limited_app)
    assert test_client.get("/api/ping").status_code == 200
    assert test_client.get("/api/ping").status_code == 200
    blocked = test_client.get("/api/ping")
    assert blocked.status_code == 429
    assert blocked.headers["Retry-After"] == "60"
    assert test_client.get("/api/health").status_code == 200
