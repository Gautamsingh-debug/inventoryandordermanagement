"""Customers router — RESTful endpoints for customer management."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.services import customer_service

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.get("/", response_model=list[CustomerRead])
async def list_customers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    session: AsyncSession = Depends(get_db),
) -> list[CustomerRead]:
    """Return a paginated list of customers."""
    customers = await customer_service.get_customers(
        session, skip=skip, limit=limit
    )
    return [CustomerRead.model_validate(c) for c in customers]


@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(
    customer_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> CustomerRead:
    """Return a single customer by ID."""
    customer = await customer_service.get_customer(session, customer_id)
    return CustomerRead.model_validate(customer)


@router.post("/", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
async def create_customer(
    data: CustomerCreate,
    session: AsyncSession = Depends(get_db),
) -> CustomerRead:
    """Create a new customer."""
    customer = await customer_service.create_customer(session, data)
    return CustomerRead.model_validate(customer)


@router.patch("/{customer_id}", response_model=CustomerRead)
async def update_customer(
    customer_id: UUID,
    data: CustomerUpdate,
    session: AsyncSession = Depends(get_db),
) -> CustomerRead:
    """Partially update an existing customer."""
    customer = await customer_service.update_customer(session, customer_id, data)
    return CustomerRead.model_validate(customer)


@router.delete("/{customer_id}")
async def delete_customer(
    customer_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> Response:
    """Hard-delete a customer (fails if they have orders)."""
    await customer_service.delete_customer(session, customer_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
