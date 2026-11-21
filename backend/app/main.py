import time
import logging
from collections import defaultdict
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import aqi, plan, chat, impact, community, school

# Configure structured application logger
logger = logging.getLogger("breathewise")
logging.basicConfig(level=getattr(logging, settings.log_level, logging.INFO))

app = FastAPI(
    title="BreatheWise API",
    description="GenAI companion for cleaner air and smarter days - Urban Air Quality Assistant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# In-memory rate limiting table: client_ip -> list of epoch timestamps
_REQUEST_HISTORY: dict[str, list[float]] = defaultdict(list)

# Rate Limiting Middleware
@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    """
    Enforces per-client IP rate limiting to prevent automated scraping and DoS.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    window_start = now - 60.0

    # Clean old requests outside 60-second window
    history = [t for t in _REQUEST_HISTORY[client_ip] if t > window_start]
    if len(history) >= settings.rate_limit_requests_per_minute:
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "Rate limit exceeded. Maximum 120 requests per minute allowed.",
                "retry_after_seconds": 60
            },
            headers={"Retry-After": "60"}
        )

    history.append(now)
    _REQUEST_HISTORY[client_ip] = history
    return await call_next(request)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Injects OWASP recommended HTTP security headers across all responses.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Global Exception Handler (Suppresses Internal Stack Traces)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catches all unhandled exceptions, logs detailed traces internally,
    and returns a safe generic JSON error to prevent security leakage.
    """
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "An internal server error occurred. Please try again later.",
            "status": 500
        }
    )

# CORS Middleware (Restricted to frontend origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
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
    """
    Service health probe and metadata endpoint.
    """
    return {
        "app": "BreatheWise",
        "tagline": "Cleaner air begins with smarter daily choices.",
        "status": "healthy",
        "docs_url": "/docs",
        "demo_mode": settings.demo_mode,
        "llm_provider": settings.llm_provider
    }

@app.get("/api/health", tags=["Health"])
async def health_check() -> dict[str, str | bool | None]:
    """
    Detailed operational readiness probe.
    """
    return {
        "status": "ok",
        "demo_mode": settings.demo_mode,
        "llm_provider": settings.llm_provider,
        "aqi_provider": settings.aqi_provider
    }
