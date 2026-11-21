from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import aqi, plan, chat, impact, community, school

app = FastAPI(
    title="BreatheWise API",
    description="GenAI companion for cleaner air and smarter days - Urban Air Quality Assistant",
    version="1.0.0"
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(aqi.router)
app.include_router(plan.router)
app.include_router(chat.router)
app.include_router(impact.router)
app.include_router(community.router)
app.include_router(school.router)

@app.get("/")
async def root():
    return {
        "app": "BreatheWise",
        "tagline": "Cleaner air begins with smarter daily choices.",
        "status": "healthy",
        "docs_url": "/docs",
        "demo_mode": settings.demo_mode,
        "llm_provider": settings.llm_provider
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "demo_mode": settings.demo_mode,
        "llm_provider": settings.llm_provider,
        "aqi_provider": settings.aqi_provider
    }
