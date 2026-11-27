import json
from pathlib import Path

from app.services.air_quality import calculate_cpcb_aqi, get_aqi_category_and_color

FIXTURE_PATH = Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "cpcb_cases.json"


def test_fixture_file_exists():
    assert FIXTURE_PATH.exists(), f"Shared test fixture not found at {FIXTURE_PATH}"


def test_cpcb_parity_cases():
    with open(FIXTURE_PATH, "r", encoding="utf-8") as f:
        cases = json.load(f)

    for case in cases:
        inputs = case["inputs"]
        expected = case["expected"]

        aqi = calculate_cpcb_aqi(
            pm2_5=inputs.get("pm2_5"),
            pm10=inputs.get("pm10"),
            no2=inputs.get("no2"),
            so2=inputs.get("so2"),
            co=inputs.get("co"),
            o3=inputs.get("o3"),
            round_conc=True,
        )

        cat, _ = get_aqi_category_and_color(aqi)

        assert aqi == expected["aqi"], f"Failed on '{case['description']}': expected AQI {expected['aqi']}, got {aqi}"
        assert (
            cat == expected["category"]
        ), f"Failed on '{case['description']}': expected category '{expected['category']}', got '{cat}'"
