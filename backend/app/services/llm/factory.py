from app.config import settings
from app.services.llm.base import BaseLLMProvider
from app.services.llm.demo_llm import DemoLLMProvider
from app.services.llm.gemini import GeminiLLMProvider
from app.services.llm.openai_compat import OpenAICompatLLMProvider

def get_llm_provider() -> BaseLLMProvider:
    if settings.demo_mode:
        return DemoLLMProvider()

    provider = settings.llm_provider.lower()
    if provider == "gemini":
        return GeminiLLMProvider()
    elif provider in ("openai", "openai_compat"):
        return OpenAICompatLLMProvider()

    return DemoLLMProvider()
