"""Product service — async CRUD helpers for the Product model."""

from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def get_products(
    session: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 20,
    active_only: bool = True,
) -> list[Product]:
    """Return a paginated list of products, optionally filtering active-only."""
    stmt = select(Product).offset(skip).limit(limit)
    if active_only:
        stmt = stmt.where(Product.is_active.is_(True))
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_product(session: AsyncSession, product_id: UUID) -> Product:
    """Return a single product by ID, or raise 404."""
    product = await session.get(Product, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )
    return product


async def create_product(
    session: AsyncSession, data: ProductCreate
) -> Product:
    """Create a new product. Raises 409 on duplicate SKU."""
    product = Product(**data.model_dump())
    session.add(product)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{data.sku}' already exists",
        )
    await session.commit()
    await session.refresh(product)
    return product


async def update_product(
    session: AsyncSession,
    product_id: UUID,
    data: ProductUpdate,
) -> Product:
    """Partially update a product. Raises 404 / 409 on duplicate SKU."""
    product = await get_product(session, product_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{data.sku}' already exists",
        )
    await session.commit()
    await session.refresh(product)
    return product


async def delete_product(session: AsyncSession, product_id: UUID) -> None:
    """Soft-delete a product by setting is_active to False."""
    product = await get_product(session, product_id)
    product.is_active = False
    await session.commit()
