from fastapi import APIRouter, Query
from app.models.schemas import ImpactSummary, HouseholdProfile, TransportProfile, HomeProfile
from app.services.impact import calculate_overall_impact
from app.services.air_quality import fetch_air_quality

router = APIRouter(prefix="/api/impact", tags=["Impact"])

@router.get("/summary", response_model=ImpactSummary)
async def get_impact_summary(
    city: str = Query("Delhi"),
    mode: str = Query("petrol_car"),
    commute_km: float = Query(15.0),
    wfh_days: int = Query(2),
    has_purifier: bool = Query(False)
):
    aqi_data = await fetch_air_quality(city)
    pm25 = aqi_data.get("current", {}).get("pm2_5", 150.0)
    
    mock_household = HouseholdProfile(
        transport=TransportProfile(mode=mode, commute_km=commute_km),
        home=HomeProfile(has_purifier=has_purifier),
        work_from_home_days=wfh_days
    )
    
    summary = calculate_overall_impact(pm25, mock_household)
    return summary
