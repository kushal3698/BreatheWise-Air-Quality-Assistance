from app.services.air_quality import (
    CPCB_BREAKPOINTS,
    calculate_cpcb_aqi,
    calculate_sub_index,
    compute_safe_windows,
    get_aqi_category_and_color,
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

    # Exact CPCB breakpoint check: PM2.5=60.1 gives 100 after integer rounding, PM10=118.3 gives 112
    sub_pm25 = calculate_sub_index(60.1, CPCB_BREAKPOINTS["pm2_5"])
    sub_pm10 = calculate_sub_index(118.3, CPCB_BREAKPOINTS["pm10"])
    assert sub_pm25 == 100
    assert sub_pm10 == 112

    aqi_official = calculate_cpcb_aqi(pm2_5=60.1, pm10=118.3)
    assert aqi_official == 112

    # Delhi benchmark: PM2.5=178.4 (sub-index 345), PM10=288.0 (sub-index 238), NO2=45.2 (sub-index 56)
    aqi_delhi = calculate_cpcb_aqi(pm2_5=178.4, pm10=288.0, no2=45.2)
    assert aqi_delhi == 345


def test_aqi_categories_and_colors():
    cat, col = get_aqi_category_and_color(45)
    assert cat == "Good"
    assert col == "#2ecc71"

    cat, col = get_aqi_category_and_color(285)
    assert cat == "Poor"

    cat, col = get_aqi_category_and_color(450)
    assert cat == "Severe"


def test_safe_windows_derived_from_forecast():
    """Verify safe window is derived mathematically from the minimum in the diurnal forecast."""
    forecast = [
        {"hour": "06:00", "aqi": 340, "pm2_5": 210.0},
        {"hour": "08:00", "aqi": 360, "pm2_5": 230.0},
        {"hour": "10:00", "aqi": 300, "pm2_5": 190.0},
        {"hour": "12:00", "aqi": 240, "pm2_5": 150.0},
        {"hour": "14:00", "aqi": 220, "pm2_5": 135.0},
        {"hour": "16:00", "aqi": 230, "pm2_5": 140.0},
        {"hour": "18:00", "aqi": 290, "pm2_5": 180.0},
    ]
    safe = compute_safe_windows(forecast)
    assert len(safe) > 0
    # Safe window must identify the afternoon dip (14:00) with minimum AQI
    assert safe[0]["avg_aqi"] <= 240
    assert "Lowest forecast AQI" in safe[0]["guidance"]
