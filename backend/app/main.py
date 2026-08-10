from pathlib import Path

from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.vehicles import router as vehicles_router
from app.api.trips import router as trips_router
from app.api.fuel_prices import router as fuel_prices_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.core.middleware import SecurityAndLoggingMiddleware
import logging


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)
    application = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="FuelWise backend API",
        docs_url=None if settings.environment == "production" else "/docs",
        redoc_url=None if settings.environment == "production" else "/redoc",
        openapi_url=None if settings.environment == "production" else "/openapi.json",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Accept", "Content-Type"],
    )
    application.add_middleware(SecurityAndLoggingMiddleware, settings=settings)

    @application.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unknown")
        logging.getLogger("fuelwise.error").exception(
            "unhandled_exception",
            extra={"request_id": request_id, "method": request.method, "path": request.url.path, "status_code": 500},
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred.", "request_id": request_id},
        )
    application.include_router(auth_router, prefix="/api/v1")
    application.include_router(vehicles_router, prefix="/api/v1")
    application.include_router(trips_router, prefix="/api/v1")
    application.include_router(fuel_prices_router, prefix="/api/v1")

    @application.get("/health", tags=["Health"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    frontend_directory = Path(__file__).resolve().parents[2] / "frontend"
    if frontend_directory.exists():
        application.mount("/", StaticFiles(directory=frontend_directory, html=True), name="frontend")

    return application


app = create_app()
