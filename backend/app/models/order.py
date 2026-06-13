"""Order domain model and status enumeration."""

from __future__ import annotations

import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Index, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from .customer import Customer
    from .order_item import OrderItem


class OrderStatus(str, enum.Enum):
    """Lifecycle states for an order."""

    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


class Order(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Represents a customer order containing one or more line items."""

    __tablename__ = "orders"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=Decimal("0.00"),
    )
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status", create_constraint=True),
        default=OrderStatus.PENDING,
        nullable=False,
    )

    # --- relationships ---
    customer: Mapped[Customer] = relationship(
        back_populates="orders",
        lazy="selectin",
    )
    items: Mapped[list[OrderItem]] = relationship(
        back_populates="order",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    # --- table-level indexes ---
    __table_args__ = (
        Index("ix_orders_customer_id", "customer_id"),
        Index("ix_orders_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Order(id={self.id!s}, status={self.status.value})>"
