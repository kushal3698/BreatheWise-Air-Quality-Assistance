import pytest
from app.services.air_quality import (
    calculate_cpcb_aqi,
    get_aqi_category_and_color,
    compute_safe_windows
)

def test_cpcb_aqi_calculation():
    # Good AQI
    assert calculate_cpcb_aqi(pm2_5=20.0, pm10=40.0) <= 50
    # Poor AQI
    aqi_poor = calculate_cpcb_aqi(pm2_5=105.0, pm10=220.0)
    assert 201 <= aqi_poor <= 300
    # Severe AQI
    aqi_severe = calculate_cpcb_aqi(pm2_5=280.0, pm10=480.0)
    assert aqi_severe >= 401
    # Exact CPCB breakpoint check: PM2.5=60.1 (sub-index 98), PM10=118.3 (sub-index 113)
    aqi_official = calculate_cpcb_aqi(pm2_5=60.1, pm10=118.3)
    assert aqi_official == 113
    # Delhi benchmark: PM2.5=178.4 (sub-index 428), PM10=288.0 (sub-index 338), NO2=45.2 (sub-index 56)
    aqi_delhi = calculate_cpcb_aqi(pm2_5=178.4, pm10=288.0, no2=45.2)
    assert aqi_delhi == 428

def test_aqi_categories_and_colors():
    cat, col = get_aqi_category_and_color(45)
    assert cat == "Good"
    assert col == "#2ecc71"
    
    cat, col = get_aqi_category_and_color(285)
    assert cat == "Poor" or cat == "Very Poor"
    
    cat, col = get_aqi_category_and_color(450)
    assert cat == "Severe"

def test_compute_safe_windows():
    forecast = [
        {"hour": "06:00", "aqi": 340, "pm2_5": 210.0},
        {"hour": "08:00", "aqi": 360, "pm2_5": 230.0},
        {"hour": "10:00", "aqi": 300, "pm2_5": 190.0},
        {"hour": "12:00", "aqi": 240, "pm2_5": 150.0},
        {"hour": "14:00", "aqi": 220, "pm2_5": 135.0},
        {"hour": "16:00", "aqi": 230, "pm2_5": 140.0},
        {"hour": "18:00", "aqi": 290, "pm2_5": 180.0}
    ]
    safe = compute_safe_windows(forecast)
    assert len(safe) > 0
    assert safe[0]["avg_aqi"] < 300
