import pytest

from app.config import settings
from app.models.schemas import HomeProfile, HouseholdMember, HouseholdProfile, TransportProfile
from app.services.geocoding import geocode_city
from app.services.llm.demo_llm import DemoLLMProvider
from app.services.llm.factory import get_llm_provider
from app.services.llm.gemini import GeminiLLMProvider
from app.services.llm.openai_compat import OpenAICompatLLMProvider
from app.services.rag import KnowledgeBaseRetriever, RAGDocumentChunk


@pytest.mark.anyio
async def test_geocoding_known_cities():
    res_delhi = await geocode_city("Delhi")
    assert res_delhi["name"] == "Delhi"
    assert res_delhi["lat"] == pytest.approx(28.6139, abs=0.01)

    res_guntur = await geocode_city("Guntur")
    assert res_guntur["name"] == "Guntur"
    assert res_guntur["lat"] == pytest.approx(16.3067, abs=0.01)


@pytest.mark.anyio
async def test_geocoding_aliases():
    res_bangalore = await geocode_city("Bangalore")
    assert res_bangalore["name"] == "Bengaluru"

    res_vizag = await geocode_city("Vizag")
    assert res_vizag["name"] == "Visakhapatnam"

    res_trivandrum = await geocode_city("Trivandrum")
    assert res_trivandrum["name"] == "Thiruvananthapuram"


@pytest.mark.anyio
async def test_geocoding_fallback():
    res_unknown = await geocode_city("ImaginaryCity123")
    assert res_unknown["name"] == "Imaginarycity123"
    assert "lat" in res_unknown
    assert "lon" in res_unknown


def test_rag_chunk_tokenization():
    chunk = RAGDocumentChunk(
        source="kb/test.md",
        title="Indoor Air Filtration",
        content="HEPA purifiers and Corsi-Rosenthal boxes significantly reduce indoor PM2.5 concentrations.",
    )
    assert "hepa" in chunk.tokens
    assert "purifiers" in chunk.tokens
    assert "corsi-rosenthal" in chunk.tokens
    assert "and" not in chunk.tokens  # Stopword removed


def test_rag_retriever_query():
    retriever = KnowledgeBaseRetriever(settings.knowledge_base_path)
    results = retriever.retrieve("Corsi-Rosenthal box indoor air", top_k=2)
    assert len(results) > 0
    assert any("indoor" in r["title"].lower() or "indoor" in r["content"].lower() for r in results)


def test_rag_retriever_empty_query():
    retriever = KnowledgeBaseRetriever(settings.knowledge_base_path)
    assert retriever.retrieve("") == []
    assert retriever.retrieve("   ") == []


def test_llm_factory_selection(monkeypatch):
    # In Demo Mode: always returns DemoLLMProvider
    monkeypatch.setattr(settings, "demo_mode", True)
    provider = get_llm_provider()
    assert isinstance(provider, DemoLLMProvider)

    # In Live Mode with Gemini:
    monkeypatch.setattr(settings, "demo_mode", False)
    monkeypatch.setattr(settings, "llm_provider", "gemini")
    provider_gemini = get_llm_provider()
    assert isinstance(provider_gemini, GeminiLLMProvider)

    # In Live Mode with OpenAI compat:
    monkeypatch.setattr(settings, "llm_provider", "openai_compat")
    provider_openai = get_llm_provider()
    assert isinstance(provider_openai, OpenAICompatLLMProvider)


@pytest.mark.anyio
async def test_demo_llm_multilingual_plans():
    demo = DemoLLMProvider()
    aqi_data = {
        "location": {"name": "Delhi"},
        "current": {"aqi": 345, "category": "Very Poor", "pm2_5": 178.4, "dominant_pollutant": "PM2.5"},
        "safe_windows": [{"start": "13:00", "end": "16:00", "avg_aqi": 210, "guidance": "Lowest forecast AQI"}],
    }
    household = HouseholdProfile(
        members=[
            HouseholdMember(role="child", age=8, sensitivities=[]),
            HouseholdMember(role="adult", age=35, sensitivities=["asthma"]),
        ],
        transport=TransportProfile(mode="petrol_car", commute_km=15.0),
        home=HomeProfile(has_purifier=False),
        work_from_home_days=2,
    )

    for lang in ["en", "hi", "te", "ta"]:
        plan = await demo.generate_plan(
            city="Delhi", aqi_data=aqi_data, household=household, rag_context=[], language=lang
        )
        assert "summary" in plan
        assert "sections" in plan
        assert "low_emission_routines" in plan["sections"]
        assert "indoor_air_hacks" in plan["sections"]
        assert "sustainable_alternatives" in plan["sections"]
        assert "impact_summary" in plan
        assert plan["impact_summary"]["exposure_reduction_pct"] > 0
