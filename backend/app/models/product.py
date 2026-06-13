"""Product domain model."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from .order_item import OrderItem


class Product(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Represents an inventory product / SKU."""

    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    # --- relationships ---
    order_items: Mapped[list[OrderItem]] = relationship(
        back_populates="product",
        lazy="selectin",
    )

    # --- table-level constraints & indexes ---
    __table_args__ = (
        CheckConstraint("stock_quantity >= 0", name="ck_products_stock_non_negative"),
        CheckConstraint("price >= 0", name="ck_products_price_non_negative"),
        Index("ix_products_sku", "sku"),
    )

    def __repr__(self) -> str:
        return f"<Product(sku={self.sku!r}, name={self.name!r})>"
