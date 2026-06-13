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


from app.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager."""
    # --- Startup ---
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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
    allow_origins=["*"],
    allow_credentials=False,
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
