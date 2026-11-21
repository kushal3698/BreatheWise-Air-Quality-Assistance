from fastapi import APIRouter
from app.models.schemas import DailyPlanRequest, DailyPlanResponse
from app.services.air_quality import fetch_air_quality
from app.services.rag import retriever
from app.services.llm.factory import get_llm_provider

router = APIRouter(prefix="/api", tags=["Planning"])

@router.post("/plan", response_model=DailyPlanResponse)
async def generate_daily_plan(request: DailyPlanRequest):
    city = request.city or "Delhi"
    aqi_data = await fetch_air_quality(city)
    
    # RAG Context Retrieval
    query = f"daily air pollution plan routines safe window indoor ventilation {city}"
    if request.household and request.household.members:
        sensitivities = []
        for m in request.household.members:
            sensitivities.extend(m.sensitivities)
        if sensitivities:
            query += f" {' '.join(sensitivities)}"
            
    rag_context = retriever.retrieve(query, top_k=3)
    
    llm = get_llm_provider()
    plan_dict = await llm.generate_plan(
        city=city,
        aqi_data=aqi_data,
        household=request.household,
        rag_context=rag_context,
        language=request.language
    )
    
    return plan_dict
