from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.air_quality import fetch_air_quality
from app.services.rag import retriever
from app.services.llm.factory import get_llm_provider

router = APIRouter(prefix="/api", tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_breathewise(request: ChatRequest):
    city = request.city or "Delhi"
    aqi_data = await fetch_air_quality(city)
    
    # Retrieve RAG snippets matching user message
    rag_context = retriever.retrieve(request.message, top_k=3)
    
    llm = get_llm_provider()
    history_dicts = [{"role": h.role, "content": h.content} for h in request.history] if request.history else []
    
    reply_dict = await llm.generate_chat_reply(
        message=request.message,
        city=city,
        aqi_data=aqi_data,
        household=request.household,
        rag_context=rag_context,
        language=request.language,
        history=history_dicts
    )
    
    return reply_dict
