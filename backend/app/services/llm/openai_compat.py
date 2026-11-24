import json
import logging
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings
from app.models.schemas import DailyPlanResponse, HouseholdProfile
from app.services.llm.base import BaseLLMProvider
from app.services.llm.demo_llm import DemoLLMProvider

logger = logging.getLogger(__name__)


class OpenAICompatLLMProvider(BaseLLMProvider):
    """OpenAI-compatible provider. Plans may come from the model; chat replies are rule-based."""

    def __init__(self):
        self.demo = DemoLLMProvider()

    async def generate_plan(
        self,
        city: str,
        aqi_data: Dict[str, Any],
        household: Optional[HouseholdProfile],
        rag_context: List[Dict[str, Any]],
        language: str = "en",
    ) -> Dict[str, Any]:
        if not settings.openai_compat_api_key or not settings.openai_compat_base_url:
            return await self.demo.generate_plan(city, aqi_data, household, rag_context, language)

        url = f"{settings.openai_compat_base_url.rstrip('/')}/chat/completions"
        headers = {"Authorization": f"Bearer {settings.openai_compat_api_key}", "Content-Type": "application/json"}
        payload = {
            "model": settings.openai_compat_model,
            "messages": [
                {"role": "system", "content": "You are BreatheWise. Produce JSON response for daily air plan."},
                {"role": "user", "content": f"City: {city}, AQI: {json.dumps(aqi_data.get('current', {}))}"},
            ],
            "response_format": {"type": "json_object"},
        }
        # Deterministic plan: sole source of numeric impact figures and fallback output.
        demo_plan = await self.demo.generate_plan(city, aqi_data, household, rag_context, language)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                content = res.json()["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                parsed["impact_summary"] = demo_plan["impact_summary"]
                return DailyPlanResponse(**parsed).model_dump()
            logger.warning("OpenAI-compatible plan request returned HTTP %s; using rule-based plan.", res.status_code)
        except Exception as exc:
            logger.warning("OpenAI-compatible plan call failed (%s); using rule-based plan.", type(exc).__name__)
        return demo_plan

    async def generate_chat_reply(
        self,
        message: str,
        city: str,
        aqi_data: Dict[str, Any],
        household: Optional[HouseholdProfile],
        rag_context: List[Dict[str, Any]],
        language: str = "en",
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        return await self.demo.generate_chat_reply(message, city, aqi_data, household, rag_context, language, history)
