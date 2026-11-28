from fastapi.testclient import TestClient

from app.main import app
from app.models.schemas import HouseholdMember, HouseholdProfile

client = TestClient(app)

MOCK_AQI_HIGH = {
    "location": {"name": "Delhi", "state": "Delhi", "country": "India", "lat": 28.61, "lon": 77.20},
    "current": {
        "aqi": 345,
        "category": "Very Poor",
        "cpcb_color": "#e67e22",
        "dominant_pollutant": "PM2.5",
        "pm2_5": 178.4,
        "pm10": 288.0,
        "no2": 45.2,
        "so2": 15.0,
        "co": 1.2,
        "o3": 28.0,
    },
    "forecast": [
        {"hour": "08:00", "aqi": 360, "category": "Very Poor", "pm2_5": 190.0},
        {"hour": "14:00", "aqi": 210, "category": "Poor", "pm2_5": 110.0},
    ],
    "safe_windows": [{"start": "13:00", "end": "16:00", "avg_aqi": 210, "guidance": "Lowest forecast AQI"}],
}

MOCK_AQI_MODERATE = {
    "location": {"name": "Bengaluru", "state": "Karnataka", "country": "India", "lat": 12.97, "lon": 77.59},
    "current": {
        "aqi": 112,
        "category": "Moderate",
        "cpcb_color": "#f1c40f",
        "dominant_pollutant": "PM10",
        "pm2_5": 38.0,
        "pm10": 118.3,
        "no2": 22.0,
        "so2": 8.0,
        "co": 0.6,
        "o3": 18.0,
    },
    "forecast": [
        {"hour": "08:00", "aqi": 130, "category": "Moderate", "pm2_5": 45.0},
        {"hour": "14:00", "aqi": 95, "category": "Satisfactory", "pm2_5": 30.0},
    ],
    "safe_windows": [{"start": "12:00", "end": "16:00", "avg_aqi": 95, "guidance": "Optimal outdoor activity"}],
}


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "BreatheWise"
    assert data["status"] == "healthy"


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_security_headers_and_rate_limiting():
    response = client.get("/")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "X-XSS-Protection" not in response.headers
    assert response.headers["Permissions-Policy"] == "camera=(), microphone=(), geolocation=()"
    assert response.headers["Content-Security-Policy"] == "default-src 'self'; frame-ancestors 'none'"
    assert "Strict-Transport-Security" in response.headers
    assert "X-RateLimit-Limit" in response.headers
    assert "X-RateLimit-Remaining" in response.headers


def test_get_aqi_endpoint():
    response = client.get("/api/aqi?city=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert data["current"]["aqi"] > 0
    assert "pm2_5" in data["current"]
    assert "station" in data
    assert "weather" in data
    assert len(data["forecast"]) >= 1


def test_school_guidance_high_aqi(monkeypatch):
    async def fake_fetch(city):
        return MOCK_AQI_HIGH

    monkeypatch.setattr("app.routers.school.fetch_air_quality", fake_fetch)
    response = client.get("/api/school/guidance?city=Delhi")
    assert response.status_code == 200
    data = response.json()
    assert data["aqi"] == 345
    assert data["category"] == "Very Poor"
    assert "STRICT INDOOR ONLY" in data["assembly_guideline"]
    assert "CANCELLED" in data["sports_guideline"]
    assert len(data["precautions_for_asthmatic_students"]) >= 2


def test_school_guidance_moderate_aqi(monkeypatch):
    async def fake_fetch(city):
        return MOCK_AQI_MODERATE

    monkeypatch.setattr("app.routers.school.fetch_air_quality", fake_fetch)
    response = client.get("/api/school/guidance?city=Bengaluru")
    assert response.status_code == 200
    data = response.json()
    assert data["aqi"] == 112
    assert "NORMAL" in data["assembly_guideline"]
    assert "NORMAL" in data["sports_guideline"]


def test_community_challenges_endpoint():
    response = client.get("/api/community/challenges")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    assert any(c["id"] == "c1" for c in data)
    assert any("Car-Free" in c["title"] for c in data)


def test_community_leaderboard_endpoint():
    response = client.get("/api/community/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    assert any(entry["city"] == "Delhi" for entry in data)
    assert any(entry["city"] == "Guntur" for entry in data)


def test_impact_summary_endpoint(monkeypatch):
    async def fake_fetch(city):
        return MOCK_AQI_HIGH

    monkeypatch.setattr("app.routers.impact.fetch_air_quality", fake_fetch)
    response = client.get("/api/impact/summary?city=Delhi&mode=petrol_car&commute_km=15&wfh_days=2&has_purifier=true")
    assert response.status_code == 200
    data = response.json()
    assert data["exposure_reduction_pct"] > 0
    assert data["co2_avoided_kg_week"] > 0
    assert data["cost_saved_inr_month"] > 0
    assert data["cigarettes_avoided_day"] > 0


def test_chat_endpoint(monkeypatch):
    async def fake_fetch(city):
        return MOCK_AQI_HIGH

    monkeypatch.setattr("app.routers.chat.fetch_air_quality", fake_fetch)

    body = {
        "message": "Can my child play outside at 4 PM in Delhi?",
        "city": "Delhi",
        "language": "en",
        "household": HouseholdProfile(members=[HouseholdMember(role="child", age=8, sensitivities=[])]).model_dump(),
        "history": [{"role": "user", "content": "Hello"}],
    }
    response = client.post("/api/chat", json=body)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 20
    assert len(data["grounded_sources"]) >= 1
    assert "disclaimer" in data
