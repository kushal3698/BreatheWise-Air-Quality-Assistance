from fastapi import APIRouter, Query

from app.models.schemas import HomeProfile, HouseholdProfile, ImpactSummary, TransportProfile, coerce_safe_city
from app.services.air_quality import fetch_air_quality
from app.services.impact import calculate_overall_impact

router = APIRouter(prefix="/api/impact", tags=["Impact"])


@router.get("/summary", response_model=ImpactSummary)
async def get_impact_summary(
    city: str = Query("Delhi", max_length=60, description="City name"),
    mode: str = Query("petrol_car", description="Primary commute transit mode"),
    commute_km: float = Query(15.0, ge=0.0, le=200.0, description="One-way commute distance in kilometers"),
    wfh_days: int = Query(2, ge=0, le=7, description="Number of work-from-home days per week"),
    has_purifier: bool = Query(False, description="Whether the household operates a HEPA air purifier"),
) -> ImpactSummary:
    """
    Computes quantified personal and environmental impact metrics:
      - Relative personal PM2.5 exposure reduction percentage
      - Weekly avoided CO2 emissions in kg
      - Monthly transportation fuel cost savings in INR
      - Equivalent daily cigarette smoke avoidance
    """
    safe_city = coerce_safe_city(city)
    aqi_data = await fetch_air_quality(safe_city)
    pm25 = aqi_data.get("current", {}).get("pm2_5", 150.0)

    mock_household = HouseholdProfile(
        transport=TransportProfile(mode=mode, commute_km=commute_km),
        home=HomeProfile(has_purifier=has_purifier),
        work_from_home_days=wfh_days,
    )

    summary = calculate_overall_impact(pm25, mock_household)
    return summary
