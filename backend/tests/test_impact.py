import pytest
from app.services.impact import calculate_action_impact, calculate_overall_impact
from app.models.schemas import HouseholdProfile, TransportProfile, HomeProfile

def test_calculate_action_impact_exercise():
    impact = calculate_action_impact("exercise", outdoor_pm25=220.0)
    assert impact["exposure_reduction_pct"] == 65.0
    assert impact["confidence"] == "Modelled estimate"

def test_calculate_action_impact_commute():
    hh = HouseholdProfile(transport=TransportProfile(mode="petrol_car", commute_km=20.0))
    impact = calculate_action_impact("commute", outdoor_pm25=180.0, household=hh)
    assert impact["co2_saved_kg"] > 0
    assert impact["cost_saved_inr"] > 0
    assert impact["exposure_reduction_pct"] == 35.0

def test_calculate_overall_impact():
    hh = HouseholdProfile(
        transport=TransportProfile(mode="petrol_car", commute_km=15.0, school_run_km=4.0),
        home=HomeProfile(has_purifier=False),
        work_from_home_days=2
    )
    summary = calculate_overall_impact(outdoor_pm25=190.0, household=hh)
    assert summary.exposure_reduction_pct > 0
    assert summary.co2_avoided_kg_week > 0
    assert summary.cost_saved_inr_month > 0
    assert summary.cigarettes_avoided_day > 0
