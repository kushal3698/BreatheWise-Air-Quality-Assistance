from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from app.models.schemas import HouseholdProfile


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_plan(
        self,
        city: str,
        aqi_data: Dict[str, Any],
        household: Optional[HouseholdProfile],
        rag_context: List[Dict[str, Any]],
        language: str = "en",
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
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
        pass
