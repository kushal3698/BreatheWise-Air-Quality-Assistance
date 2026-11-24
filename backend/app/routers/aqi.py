from fastapi import APIRouter, Query

from app.models.schemas import AirQualityResponse
from app.services.air_quality import fetch_air_quality

router = APIRouter(prefix="/api", tags=["Air Quality"])


@router.get("/aqi", response_model=AirQualityResponse)
async def get_air_quality(
    city: str = Query(
        "Delhi", max_length=60, description="Indian city name or coordinates for localized air monitoring"
    )
) -> AirQualityResponse:
    """
    Fetches official CPCB NAQI-compliant air quality index and 24-hour diurnal forecast.

    Includes calibrated concentrations for PM2.5, PM10, NO2, SO2, CO, and O3,
    along with weather parameters and optimal safe outdoor activity windows.
    """
    data = await fetch_air_quality(city)
    return data
