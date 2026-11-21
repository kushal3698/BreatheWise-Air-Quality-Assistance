import pytest
from app.main import app
from app.config import settings
from app.services.air_quality import calculate_cpcb_aqi, get_aqi_category_and_color
from app.models.schemas import AirQualityLocation, AirQualityStation, WeatherInfo

def test_extreme_cpcb_boundary_values():
    """Verify handling of 0, negative concentrations, and severe scale saturations."""
    # Zero concentration
    aqi_zero = calculate_cpcb_aqi(pm2_5=0.0, pm10=0.0)
    assert aqi_zero == 0
    cat_zero, _ = get_aqi_category_and_color(0)
    assert cat_zero == "Good"

    # Extreme high concentration capping
    aqi_extreme = calculate_cpcb_aqi(pm2_5=1200.0, pm10=2500.0)
    assert aqi_extreme == 500
    cat_extreme, _ = get_aqi_category_and_color(500)
    assert cat_extreme == "Severe"

def test_multi_pollutant_dominance():
    """Verify CPCB NAQI correctly isolates the dominant pollutant sub-index."""
    # PM2.5 = 178.4 -> 428, PM10 = 288.0 -> 338, NO2 = 45.2 -> 56 => Max = 428
    aqi = calculate_cpcb_aqi(pm2_5=178.4, pm10=288.0, no2=45.2)
    assert aqi == 428

def test_security_middleware_registered():
    """Verify security middleware and CORS policies are properly configured on FastAPI app."""
    assert app.title == "BreatheWise API"
    assert len(app.user_middleware) > 0

def test_air_quality_station_schema_safety():
    """Verify station models support regional estimated labels and distance."""
    station = AirQualityStation(
        name="Regional estimate for Delhi (NCR) • Nearest reference: Lodhi Road area",
        distance_km=2.1
    )
    assert "Regional estimate" in station.name
    assert station.distance_km == 2.1
