"""FastAPI application entry-point for the Inventory & Order Management System."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers.customers import router as customers_router
from app.routers.orders import router as orders_router
from app.routers.products import router as products_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager.

    Use this to run startup / shutdown logic (e.g. connection pools,
    background tasks) without the deprecated ``on_event`` decorator.
    """
    # --- Startup ---
    yield
    # --- Shutdown ---


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ---- CORS ----------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers -------------------------------------------------------------
app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)


# ---- Health check ---------------------------------------------------------
@app.get("/api/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Simple liveness probe."""
    return {"status": "healthy"}
