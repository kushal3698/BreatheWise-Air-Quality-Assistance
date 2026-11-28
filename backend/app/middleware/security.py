from __future__ import annotations

import logging
import time
from collections import defaultdict, deque
from typing import Any, Awaitable, Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("breathewise.security")

# OWASP-aligned security headers (deprecated X-XSS-Protection intentionally omitted)
SECURITY_HEADERS: dict[str, str] = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'",
}

HEALTHCHECK_PATHS: frozenset[str] = frozenset({"/api/health", "/health"})


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Injects OWASP HTTP security headers and removes server version fingerprinting."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        response = await call_next(request)
        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value
        if "server" in response.headers:
            del response.headers["server"]
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding-window per-IP rate limiter backed optionally by Redis with in-memory deque fallback."""

    def __init__(self, app: Any, rpm: int = 120, redis_url: str = "") -> None:
        super().__init__(app)
        self.rpm = max(1, rpm)
        self.window_seconds = 60
        self._memory_buckets: dict[str, deque[float]] = defaultdict(deque)
        self._redis: Any = None
        if redis_url:
            self._init_redis(redis_url)

    def _init_redis(self, redis_url: str) -> None:
        try:
            import redis

            client = redis.Redis.from_url(redis_url, decode_responses=True, socket_timeout=1)
            client.ping()
            self._redis = client
        except Exception as exc:
            logger.warning("Redis unavailable; using in-memory rate-limit fallback: %s", type(exc).__name__)

    def _evaluate_limit(self, client_ip: str) -> tuple[bool, int]:
        now = time.time()
        if self._redis is not None:
            key = f"rl:{client_ip}:{int(now // self.window_seconds)}"
            try:
                pipe = self._redis.pipeline()
                pipe.incr(key)
                pipe.expire(key, self.window_seconds + 5)
                count = int(pipe.execute()[0])
                remaining = max(0, self.rpm - count)
                return count > self.rpm, remaining
            except Exception as exc:
                logger.warning("Redis rate-limit error; falling back to local memory: %s", type(exc).__name__)

        bucket = self._memory_buckets[client_ip]
        cutoff = now - self.window_seconds
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if len(bucket) >= self.rpm:
            return True, 0
        bucket.append(now)
        return False, max(0, self.rpm - len(bucket))

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        if request.url.path in HEALTHCHECK_PATHS:
            return await call_next(request)

        forwarded = request.headers.get("x-forwarded-for")
        client_ip = (
            forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "127.0.0.1")
        )
        limited, remaining = self._evaluate_limit(client_ip)
        if limited:
            logger.warning("Rate limit exceeded for IP: %s", client_ip)
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": f"Rate limit exceeded. Maximum {self.rpm} requests per minute allowed.",
                    "retry_after_seconds": 60,
                },
                headers={"Retry-After": "60"},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.rpm)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
