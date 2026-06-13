"""Pydantic v2 schemas for Order and OrderItem operations."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# OrderItem schemas
# ---------------------------------------------------------------------------


class OrderItemCreate(BaseModel):
    """Schema for a single line-item when placing an order."""

    product_id: UUID = Field(..., description="Product to order")
    quantity: int = Field(..., gt=0, description="Quantity to order (must be > 0)")


class OrderItemRead(BaseModel):
    """Schema returned when reading an order item."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    product_name: str | None = Field(
        default=None,
        description="Denormalised product name for convenience",
    )


# ---------------------------------------------------------------------------
# Order schemas
# ---------------------------------------------------------------------------


class OrderCreate(BaseModel):
    """Schema for placing a new order."""

    customer_id: UUID = Field(..., description="Customer placing the order")
    items: list[OrderItemCreate] = Field(
        ..., min_length=1, description="At least one item required"
    )


class OrderRead(BaseModel):
    """Schema returned when reading an order."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: UUID
    total_amount: Decimal
    status: str
    items: list[OrderItemRead] = []
    created_at: datetime
    updated_at: datetime
