import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    demo_mode: bool = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    default_city: str = os.getenv("DEFAULT_CITY", "Delhi")
    default_language: str = os.getenv("DEFAULT_LANGUAGE", "en")
    
    # LLM Settings
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini").lower()
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    openai_compat_base_url: str = os.getenv("OPENAI_COMPAT_BASE_URL", "")
    openai_compat_api_key: str = os.getenv("OPENAI_COMPAT_API_KEY", "")
    openai_compat_model: str = os.getenv("OPENAI_COMPAT_MODEL", "gpt-4o-mini")
    
    # Air Quality & Cache
    aqi_provider: str = os.getenv("AQI_PROVIDER", "open-meteo").lower()
    aqi_cache_ttl_seconds: int = int(os.getenv("AQI_CACHE_TTL_SECONDS", "900"))
    waqi_token: str = os.getenv("WAQI_TOKEN", "")
    openaq_api_key: str = os.getenv("OPENAQ_API_KEY", "")
    
    # Paths
    base_dir: Path = BASE_DIR
    config_dir: Path = BASE_DIR / "config"
    knowledge_base_path: Path = BASE_DIR / "knowledge_base"
    demo_data_path: Path = BASE_DIR / "demo_data"
    
    # CORS
    cors_origins: list[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
        if origin.strip()
    ]

settings = Settings()
