import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# --- Environmental & Health Constants ---
# Berkeley Earth / WHO public health empirical relationship: ~22 µg/m³ PM2.5 over 24h ≈ 1 cigarette
PM25_CIGARETTE_EQUIVALENT_UGM3: float = 22.0

# NAAQS & WHO 24-hour guidelines (µg/m³)
NAAQS_PM25_LIMIT: float = 60.0
NAAQS_PM10_LIMIT: float = 100.0
NAAQS_NO2_LIMIT: float = 80.0
WHO_PM25_GUIDELINE: float = 15.0

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    demo_mode: bool = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    default_city: str = os.getenv("DEFAULT_CITY", "Delhi")
    default_language: str = os.getenv("DEFAULT_LANGUAGE", "en")
    
    # Rate Limiting
    rate_limit_requests_per_minute: int = int(os.getenv("RATE_LIMIT_RPM", "120"))
    
    # LLM Settings
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini").lower()
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
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
    
    # CORS: Whitelist localhost development and Vercel production frontend
    cors_origins: list[str] = [
        origin.strip() 
        for origin in os.getenv(
            "CORS_ORIGINS", 
            "http://localhost:3000,http://127.0.0.1:3000,https://breathewise-air-quality-assistance.vercel.app"
        ).split(",")
        if origin.strip()
    ]

settings = Settings()
