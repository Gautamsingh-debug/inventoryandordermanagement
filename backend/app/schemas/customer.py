"""Pydantic v2 schemas for Customer CRUD operations."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerCreate(BaseModel):
    """Schema for creating a new customer."""

    name: str = Field(..., min_length=1, description="Customer full name")
    email: EmailStr = Field(..., description="Unique email address")
    phone: str | None = Field(default=None, description="Phone number")
    address: str | None = Field(default=None, description="Mailing address")


class CustomerUpdate(BaseModel):
    """Schema for partially updating a customer. All fields optional."""

    name: str | None = Field(default=None, min_length=1)
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None


class CustomerRead(BaseModel):
    """Schema returned when reading a customer."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: EmailStr
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime
