import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.middleware.security import RateLimitMiddleware, SecurityHeadersMiddleware
from app.routers import aqi, chat, community, impact, plan, school

# Configure structured application logger
logger = logging.getLogger("breathewise")
logging.basicConfig(level=getattr(logging, settings.log_level, logging.INFO))

app = FastAPI(
    title="BreatheWise API",
    description="GenAI companion for cleaner air and smarter days - Urban Air Quality Assistant",
    version="2.0.0",
    docs_url="/docs" if settings.app_env != "production" else None,
    redoc_url="/redoc" if settings.app_env != "production" else None,
)

# Middleware stack (added bottom-up; SecurityHeadersMiddleware runs outermost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)
app.add_middleware(
    RateLimitMiddleware,
    rpm=settings.rate_limit_requests_per_minute,
    redis_url=settings.redis_url,
)
app.add_middleware(SecurityHeadersMiddleware)


# Global Exception Handler (Suppresses Internal Stack Traces)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catches all unhandled exceptions, logs detailed traces internally,
    and returns a safe generic JSON error to prevent security leakage.
    """
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "An internal server error occurred. Please try again later.", "status": 500},
    )


# Include Routers
app.include_router(aqi.router)
app.include_router(plan.router)
app.include_router(chat.router)
app.include_router(impact.router)
app.include_router(community.router)
app.include_router(school.router)


@app.get("/", tags=["Health"])
async def root() -> dict[str, str | bool | None]:
    """Service health probe and metadata endpoint."""
    return {
        "app": "BreatheWise",
        "tagline": "Cleaner air begins with smarter daily choices.",
        "status": "healthy",
        "docs_url": "/docs" if settings.app_env != "production" else None,
        "demo_mode": settings.demo_mode,
        "llm_provider": settings.llm_provider,
    }


@app.get("/api/health", tags=["Health"])
async def health_check() -> dict[str, str | bool | None]:
    """Detailed operational readiness probe."""
    return {
        "status": "ok",
        "env": settings.app_env,
        "demo_mode": settings.demo_mode,
        "llm_provider": settings.llm_provider,
        "aqi_provider": settings.aqi_provider,
    }
