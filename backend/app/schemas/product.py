"""Pydantic v2 schemas for Product CRUD operations."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    """Schema for creating a new product."""

    name: str = Field(..., min_length=1, description="Product name")
    sku: str = Field(..., min_length=1, description="Stock Keeping Unit (unique)")
    description: str | None = Field(default=None, description="Product description")
    price: Decimal = Field(..., ge=0, description="Unit price")
    stock_quantity: int = Field(default=0, ge=0, description="Initial stock quantity")


class ProductUpdate(BaseModel):
    """Schema for partially updating a product. All fields optional."""

    name: str | None = Field(default=None, min_length=1)
    sku: str | None = Field(default=None, min_length=1)
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    stock_quantity: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductRead(BaseModel):
    """Schema returned when reading a product."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    sku: str
    description: str | None
    price: Decimal
    stock_quantity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
