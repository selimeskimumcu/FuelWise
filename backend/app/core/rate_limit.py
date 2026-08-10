import hashlib
import hmac
import math
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from app.core.config import get_settings


class InMemoryRateLimiter:
    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, bucket: str, limit: int, window_seconds: int) -> None:
        now = time.monotonic()
        cutoff = now - window_seconds
        with self._lock:
            events = self._events[bucket]
            while events and events[0] <= cutoff:
                events.popleft()
            if len(events) >= limit:
                retry_after = max(1, math.ceil(events[0] + window_seconds - now))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later.",
                    headers={"Retry-After": str(retry_after)},
                )
            events.append(now)

    def clear(self) -> None:
        with self._lock:
            self._events.clear()


rate_limiter = InMemoryRateLimiter()


def client_address(request: Request) -> str:
    settings = get_settings()
    if settings.rate_limit_trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def private_key(value: str) -> str:
    secret = get_settings().jwt_secret_key.encode("utf-8")
    return hmac.new(secret, value.strip().lower().encode("utf-8"), hashlib.sha256).hexdigest()


def enforce_rate_limit(scope: str, identity: str, limit: int, window_seconds: int) -> None:
    settings = get_settings()
    if not settings.rate_limit_enabled:
        return
    rate_limiter.check(f"{scope}:{private_key(identity)}", limit, window_seconds)
