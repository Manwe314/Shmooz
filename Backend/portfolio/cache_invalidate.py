from __future__ import annotations
import logging
import time
import threading
from typing import Optional, Dict, Any
from functools import wraps
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class SimpleCircuitBreaker:
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.is_open = False
        self._lock = threading.Lock()

    def can_execute(self) -> bool:
        with self._lock:
            if not self.is_open:
                return True

            if time.time() - self.last_failure_time > self.recovery_timeout:
                logger.info("Circuit breaker attempting recovery")
                self.is_open = False
                self.failure_count = 0
                return True

            return False

    def record_success(self):
        with self._lock:
            self.failure_count = 0
            self.is_open = False

    def record_failure(self):
        with self._lock:
            self.failure_count += 1
            self.last_failure_time = time.time()

            if self.failure_count >= self.failure_threshold:
                self.is_open = True
                logger.error(f"Circuit breaker opened after {self.failure_count} failures")

_circuit_breaker = SimpleCircuitBreaker(
    failure_threshold=getattr(settings, 'CACHE_INVALIDATION_FAILURE_THRESHOLD', 5),
    recovery_timeout=getattr(settings, 'CACHE_INVALIDATION_RECOVERY_TIMEOUT', 60)
)

def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    """Simple retry decorator with exponential backoff"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries:
                        wait_time = delay * (2 ** attempt)
                        logger.warning(f"Cache invalidation attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s")
                        time.sleep(wait_time)
                    else:
                        logger.error(f"Cache invalidation failed after {max_retries + 1} attempts: {e}")

            raise last_exception
        return wrapper
    return decorator

@retry_on_failure(
    max_retries=getattr(settings, 'CACHE_INVALIDATION_MAX_RETRIES', 3),
    delay=getattr(settings, 'CACHE_INVALIDATION_BASE_DELAY', 1.0)
)
def send_invalidation(payload: dict) -> Optional[Dict[str, Any]]:
    """
    POST a JSON payload to the SSR cache invalidate endpoint.
    Production-ready with circuit breaker, retries, and proper error handling.
    """
    if not _circuit_breaker.can_execute():
        logger.warning("Cache invalidation skipped - circuit breaker is open")
        return None

    url = getattr(settings, 'FRONTEND_SSR_INVALIDATE_URL', 'http://frontend:4000/__admin/ssr-cache/invalidate')
    key = getattr(settings, 'ADMIN_CACHE_KEY', '')
    timeout = float(getattr(settings, 'SSR_INVALIDATE_TIMEOUT', 5.0))

    if not url:
        logger.error("FRONTEND_SSR_INVALIDATE_URL not configured")
        return None

    headers = {
        'x-admin-key': key,
        'Content-Type': 'application/json',
        'User-Agent': 'Django-Cache-Invalidator/1.0'
    }

    start_time = time.time()

    try:
        logger.info(f"Sending cache invalidation: {payload}")
        resp = requests.post(url, json=payload, headers=headers, timeout=timeout)

        duration = time.time() - start_time

        if resp.status_code >= 400:
            error_msg = f"SSR invalidate returned {resp.status_code} in {duration:.2f}s: {resp.text[:300]}"
            logger.error(error_msg)
            _circuit_breaker.record_failure()
            resp.raise_for_status()

        logger.info(f"Cache invalidation successful in {duration:.2f}s: {payload}")
        _circuit_breaker.record_success()

        return resp.json() if resp.content else {"ok": True}

    except requests.exceptions.Timeout:
        duration = time.time() - start_time
        logger.error(f"Cache invalidation timeout after {duration:.2f}s: {payload}")
        _circuit_breaker.record_failure()
        raise
    except requests.exceptions.ConnectionError:
        duration = time.time() - start_time
        logger.error(f"Cache invalidation connection error after {duration:.2f}s: {payload}")
        _circuit_breaker.record_failure()
        raise
    except Exception as exc:
        duration = time.time() - start_time
        logger.error(f"Cache invalidation failed after {duration:.2f}s: {exc}")
        _circuit_breaker.record_failure()
        raise

def safe_invalidate(func):
    """Decorator to safely handle cache invalidation failures without breaking the main operation"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Cache invalidation failed for {func.__name__}: {e}")
            return None
    return wrapper

@safe_invalidate
def invalidate_deck(slug: str) -> Optional[Dict[str, Any]]:
    """Invalidate deck cache for a specific slug"""
    if not slug:
        logger.warning("Cannot invalidate deck cache - slug is empty")
        return None

    logger.debug(f"Invalidating deck cache for slug: {slug}")
    return send_invalidation({"kind": "deck", "slug": slug})

@safe_invalidate
def invalidate_background(slug: str) -> Optional[Dict[str, Any]]:
    """Invalidate background cache for a specific slug"""
    if not slug:
        logger.warning("Cannot invalidate background cache - slug is empty")
        return None

    logger.debug(f"Invalidating background cache for slug: {slug}")
    return send_invalidation({"kind": "background", "slug": slug})

@safe_invalidate
def invalidate_page(slug: str, category: str) -> Optional[Dict[str, Any]]:
    """Invalidate page cache for a specific slug and category"""
    if not slug or not category:
        logger.warning(f"Cannot invalidate page cache - slug: {slug}, category: {category}")
        return None

    if category not in ['page_one', 'page_two']:
        logger.warning(f"Invalid page category: {category}")
        return None

    logger.debug(f"Invalidating page cache for slug: {slug}, category: {category}")
    return send_invalidation({"kind": "page", "slug": slug, "category": category})

@safe_invalidate
def invalidate_project_page(project_id: int, slug: str | None = None) -> Optional[Dict[str, Any]]:
    """Invalidate project page cache for a specific project ID and optional slug"""
    if not project_id:
        logger.warning("Cannot invalidate project page cache - project_id is empty")
        return None

    payload = {"kind": "project_page", "id": int(project_id)}
    if slug:
        payload["slug"] = slug

    logger.debug(f"Invalidating project page cache for project_id: {project_id}, slug: {slug}")
    return send_invalidation(payload)

def get_circuit_breaker_status() -> Dict[str, Any]:
    """Get current circuit breaker status for monitoring"""
    return {
        'is_open': _circuit_breaker.is_open,
        'failure_count': _circuit_breaker.failure_count,
        'last_failure_time': _circuit_breaker.last_failure_time,
        'failure_threshold': _circuit_breaker.failure_threshold,
        'recovery_timeout': _circuit_breaker.recovery_timeout
    }
