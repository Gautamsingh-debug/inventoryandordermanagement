"""Customer service — async CRUD helpers for the Customer model."""

from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


async def get_customers(
    session: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 20,
) -> list[Customer]:
    """Return a paginated list of customers."""
    stmt = select(Customer).offset(skip).limit(limit)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_customer(session: AsyncSession, customer_id: UUID) -> Customer:
    """Return a single customer by ID, or raise 404."""
    customer = await session.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {customer_id} not found",
        )
    return customer


async def create_customer(
    session: AsyncSession, data: CustomerCreate
) -> Customer:
    """Create a new customer. Raises 409 on duplicate email."""
    customer = Customer(**data.model_dump())
    session.add(customer)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A customer with email '{data.email}' already exists",
        )
    await session.commit()
    await session.refresh(customer)
    return customer


async def update_customer(
    session: AsyncSession,
    customer_id: UUID,
    data: CustomerUpdate,
) -> Customer:
    """Partially update a customer. Raises 404 / 409 on duplicate email."""
    customer = await get_customer(session, customer_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A customer with email '{data.email}' already exists",
        )
    await session.commit()
    await session.refresh(customer)
    return customer


async def delete_customer(session: AsyncSession, customer_id: UUID) -> None:
    """Hard-delete a customer. Raises 409 if customer has existing orders."""
    customer = await get_customer(session, customer_id)
    await session.delete(customer)
    try:
        await session.flush()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete customer {customer_id}: "
            "they have existing orders. Cancel or remove orders first.",
        )
    await session.commit()
