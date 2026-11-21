from fastapi import APIRouter, Query
from app.models.schemas import SchoolGuidanceResponse
from app.services.air_quality import fetch_air_quality

router = APIRouter(prefix="/api/school", tags=["School Guidance"])

@router.get("/guidance", response_model=SchoolGuidanceResponse)
async def get_school_guidance(city: str = Query("Delhi")):
    aqi_data = await fetch_air_quality(city)
    curr = aqi_data.get("current", {})
    aqi = curr.get("aqi", 250)
    category = curr.get("category", "Poor")

    if aqi > 300:
        assembly = "STRICT INDOOR ONLY: Morning assembly outdoors must be cancelled. Deliver announcements via classroom audio system."
        sports = "CANCELLED: All outdoor physical education, soccer, cricket, and running are suspended."
        recess = "INDOOR RECESS: Students must remain inside classrooms or indoor multi-purpose halls."
        classroom = "SEAL & PURIFY: Keep all windows and doors closed. Run classroom HEPA purifiers or Corsi-Rosenthal boxes on medium/high speed."
    elif aqi > 200:
        assembly = "Shortened indoor assembly recommended. Avoid prolonged outdoor standing in cold morning air."
        sports = "RESTRICTED: Shift heavy stamina training indoors. Limit PE to gentle stretching or board games."
        recess = "Low-intensity outdoor recess permitted for healthy children; students with asthma stay indoors."
        classroom = "Keep windows closed during morning rush hours (8:00 AM – 11:00 AM). Ventilate briefly at 2:00 PM if needed."
    else:
        assembly = "NORMAL: Outdoor morning assemblies are safe."
        sports = "NORMAL: Outdoor physical education and competitive matches permitted."
        recess = "Outdoor play permitted."
        classroom = "Open windows for cross-ventilation during warm midday hours."

    precautions = [
        "Ensure school infirmary is stocked with clean spacer devices and prescribed reliever inhalers.",
        "Enforce a 200-meter zero-idling vehicle zone around school entry gates during pickup and drop-off.",
        "Exempt students with certified respiratory sensitivities from any compulsory outdoor drills."
    ]

    return SchoolGuidanceResponse(
        aqi=aqi,
        category=category,
        city=city,
        assembly_guideline=assembly,
        sports_guideline=sports,
        recess_guideline=recess,
        classroom_guideline=classroom,
        precautions_for_asthmatic_students=precautions
    )
