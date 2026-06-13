"""Products router — RESTful endpoints for product management."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services import product_service

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/", response_model=list[ProductRead])
async def list_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    active_only: bool = Query(True, description="Filter to active products only"),
    session: AsyncSession = Depends(get_db),
) -> list[ProductRead]:
    """Return a paginated list of products."""
    products = await product_service.get_products(
        session, skip=skip, limit=limit, active_only=active_only
    )
    return [ProductRead.model_validate(p) for p in products]


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> ProductRead:
    """Return a single product by ID."""
    product = await product_service.get_product(session, product_id)
    return ProductRead.model_validate(product)


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    session: AsyncSession = Depends(get_db),
) -> ProductRead:
    """Create a new product."""
    product = await product_service.create_product(session, data)
    return ProductRead.model_validate(product)


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    session: AsyncSession = Depends(get_db),
) -> ProductRead:
    """Partially update an existing product."""
    product = await product_service.update_product(session, product_id, data)
    return ProductRead.model_validate(product)


@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> Response:
    """Soft-delete a product (set is_active=False)."""
    await product_service.delete_product(session, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
