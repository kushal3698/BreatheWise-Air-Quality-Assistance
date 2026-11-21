import pytest
from app.models.schemas import (
    DailyPlanResponse,
    PlanSections,
    PlanActionItem,
    ActionImpact,
    ImpactSummary,
    PlanTimelineItem,
    AirQualityResponse,
    AirQualityLocation,
    AirQualityStation,
    CurrentAQI,
    WeatherInfo
)

def test_daily_plan_schema_validation():
    plan = DailyPlanResponse(
        summary="Moderate air today.",
        risk_level="moderate",
        sections=PlanSections(
            low_emission_routines=[
                PlanActionItem(
                    action="Shift jog indoors",
                    why="Peak morning ground inversion.",
                    effort="low",
                    cost="free",
                    impact=ActionImpact(exposure_reduction_pct=50.0, confidence="Modelled estimate"),
                    sources=["kb/exercise_and_aqi.md"]
                )
            ],
            indoor_air_hacks=[],
            sustainable_alternatives=[]
        ),
        today_timeline=[
            PlanTimelineItem(time="13:00-16:00", advice="Ventilate home")
        ],
        impact_summary=ImpactSummary(
            exposure_reduction_pct=30.0,
            co2_avoided_kg_week=5.2,
            cost_saved_inr_month=1500.0,
            cigarettes_avoided_day=1.5
        ),
        cautions=["Keep inhaler ready."],
        disclaimer="Estimates only."
    )
    assert plan.risk_level == "moderate"
    assert len(plan.sections.low_emission_routines) == 1
    assert plan.sections.low_emission_routines[0].impact.exposure_reduction_pct == 50.0
