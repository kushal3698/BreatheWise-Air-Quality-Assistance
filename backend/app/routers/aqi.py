from fastapi import APIRouter, Query
from app.models.schemas import AirQualityResponse
from app.services.air_quality import fetch_air_quality

router = APIRouter(prefix="/api", tags=["Air Quality"])

@router.get("/aqi", response_model=AirQualityResponse)
async def get_air_quality(city: str = Query("Delhi", description="City name or coordinates")):
    data = await fetch_air_quality(city)
    return data
