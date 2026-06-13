"""OrderItem domain model – individual line items within an order."""

from __future__ import annotations

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from .order import Order
    from .product import Product


class OrderItem(UUIDPrimaryKeyMixin, Base):
    """A single line item linking an order to a product."""

    __tablename__ = "order_items"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
    )
    quantity: Mapped[int] = mapped_column(nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    # --- relationships ---
    order: Mapped[Order] = relationship(
        back_populates="items",
        lazy="selectin",
    )
    product: Mapped[Product] = relationship(
        back_populates="order_items",
        lazy="selectin",
    )

    # --- table-level constraints ---
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_order_items_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="ck_order_items_unit_price_non_negative"),
    )

    def __repr__(self) -> str:
        return f"<OrderItem(order={self.order_id!s}, product={self.product_id!s}, qty={self.quantity})>"
