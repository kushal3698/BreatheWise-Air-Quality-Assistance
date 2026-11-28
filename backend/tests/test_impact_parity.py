import json
from pathlib import Path
from typing import Any, Dict, List

from app.models.schemas import HouseholdProfile
from app.services.impact import calculate_overall_impact
from app.services.safety import get_safety_cautions

FIXTURE_PATH = Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "plan_impact_cases.json"


def test_impact_fixture_exists() -> None:
    assert FIXTURE_PATH.exists(), f"Missing golden impact fixture at {FIXTURE_PATH}"


def test_plan_impact_parity_cases() -> None:
    with open(FIXTURE_PATH, "r", encoding="utf-8") as fh:
        cases: List[Dict[str, Any]] = json.load(fh)

    for case in cases:
        hh = HouseholdProfile(**case["household"])
        expected = case["expected"]
        summary = calculate_overall_impact(float(case["outdoor_pm25"]), hh)

        assert summary.exposure_reduction_pct == expected["exposure_reduction_pct"], case["description"]
        assert summary.co2_avoided_kg_week == expected["co2_avoided_kg_week"], case["description"]
        assert summary.cost_saved_inr_month == expected["cost_saved_inr_month"], case["description"]
        assert summary.cigarettes_avoided_day == expected["cigarettes_avoided_day"], case["description"]

        cautions = get_safety_cautions(aqi=210, category="Poor", household=hh)
        has_inhaler_caution = any("inhalers" in c.lower() for c in cautions)
        assert has_inhaler_caution is expected["requires_asthma_caution"], case["description"]
