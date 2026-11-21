import json
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings
from app.models.schemas import HouseholdProfile
from app.services.llm.base import BaseLLMProvider
from app.services.llm.demo_llm import DemoLLMProvider

class GeminiLLMProvider(BaseLLMProvider):
    def __init__(self):
        self.demo = DemoLLMProvider()

    async def generate_plan(
        self,
        city: str,
        aqi_data: Dict[str, Any],
        household: Optional[HouseholdProfile],
        rag_context: List[Dict[str, Any]],
        language: str = "en"
    ) -> Dict[str, Any]:
        if not settings.gemini_api_key:
            return await self.demo.generate_plan(city, aqi_data, household, rag_context, language)

        system_instruction = (
            "You are BreatheWise, an environmental health and sustainable-living planner for families and communities.\n"
            "Use the provided live AQI, weather, household profile, and retrieved guidance snippets.\n"
            "Produce a structured JSON response with:\n"
            "1. summary: short overview\n"
            "2. risk_level: good | moderate | poor | very_poor | severe\n"
            "3. sections: low_emission_routines, indoor_air_hacks, sustainable_alternatives\n"
            "4. today_timeline: safe windows and hourly guidance\n"
            "5. cautions: specific cautions for vulnerable members\n"
            "6. disclaimer: medical safety statement\n"
            "Do NOT invent numbers; reference provided impact estimates."
        )

        user_prompt = f"""
Location: {city}
Language: {language}
Air Quality Data: {json.dumps(aqi_data.get('current', {}))}
Safe Windows: {json.dumps(aqi_data.get('safe_windows', []))}
Household: {json.dumps(household.model_dump() if household else {})}
Retrieved Guidance: {json.dumps([c['content'] for c in rag_context])}

Respond ONLY with valid JSON matching the DailyPlan schema.
"""

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]}],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.3
                }
            }
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_content = candidates[0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text_content)
                        # Ensure impact summary is present
                        if "impact_summary" not in parsed:
                            demo_plan = await self.demo.generate_plan(city, aqi_data, household, rag_context, language)
                            parsed["impact_summary"] = demo_plan["impact_summary"]
                        return parsed
        except Exception:
            pass

        return await self.demo.generate_plan(city, aqi_data, household, rag_context, language)

    async def generate_chat_reply(
        self,
        message: str,
        city: str,
        aqi_data: Dict[str, Any],
        household: Optional[HouseholdProfile],
        rag_context: List[Dict[str, Any]],
        language: str = "en",
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        if not settings.gemini_api_key:
            return await self.demo.generate_chat_reply(message, city, aqi_data, household, rag_context, language, history)

        prompt = f"""
You are BreatheWise, an environmental health and low-emission assistant.
Respond to the user's question with actionable, empathetic, scientifically grounded advice.
User question: "{message}"
City: {city}
Language: {language}
Current Air Quality: {json.dumps(aqi_data.get('current', {}))}
Safe Windows: {json.dumps(aqi_data.get('safe_windows', []))}
Household: {json.dumps(household.model_dump() if household else {})}
Relevant Knowledge: {json.dumps([c['content'] for c in rag_context])}

Explain the 'Why', provide safe window timing, and highlight quantified before-vs-after exposure/emission impact.
Never diagnose illness. Include medical safety caution if high AQI or asthma.
"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.4
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        reply_text = candidates[0]["content"]["parts"][0]["text"]
                        demo_chat = await self.demo.generate_chat_reply(message, city, aqi_data, household, rag_context, language, history)
                        return {
                            "reply": reply_text,
                            "grounded_sources": [c["source"] for c in rag_context][:3] or demo_chat["grounded_sources"],
                            "suggested_questions": demo_chat["suggested_questions"],
                            "safe_window_summary": demo_chat["safe_window_summary"],
                            "disclaimer": demo_chat["disclaimer"]
                        }
        except Exception:
            pass

        return await self.demo.generate_chat_reply(message, city, aqi_data, household, rag_context, language, history)
