"""Customer domain model."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from .order import Order


class Customer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Represents a customer who can place orders."""

    __tablename__ = "customers"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    # --- relationships ---
    orders: Mapped[list[Order]] = relationship(
        back_populates="customer",
        lazy="selectin",
    )

    # --- table-level indexes ---
    __table_args__ = (
        Index("ix_customers_email", "email"),
    )

    def __repr__(self) -> str:
        return f"<Customer(email={self.email!r}, name={self.name!r})>"
