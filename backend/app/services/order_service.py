"""Order service — the inventory engine.

Handles transactional order creation with pessimistic row-level locking,
stock validation, and automatic inventory decrement.
"""

from __future__ import annotations

from collections import defaultdict
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Customer, Order, OrderItem, OrderStatus, Product
from app.schemas.order import OrderCreate


# ---------------------------------------------------------------------------
# Read helpers
# ---------------------------------------------------------------------------


async def get_orders(
    session: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 20,
) -> list[Order]:
    """Return a paginated list of orders with eagerly loaded items."""
    stmt = (
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_order(session: AsyncSession, order_id: UUID) -> Order:
    """Return a single order with items, or raise 404."""
    stmt = (
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order_id)
    )
    result = await session.execute(stmt)
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found",
        )
    return order


# ---------------------------------------------------------------------------
# Inventory engine — transactional order creation
# ---------------------------------------------------------------------------


async def create_order(session: AsyncSession, data: OrderCreate) -> Order:
    """Create an order with full inventory validation and stock decrement.

    Steps
    -----
    1. Validate customer exists.
    2. Aggregate duplicate product_ids in the items list.
    3. Open a SAVEPOINT (``begin_nested``).
    4. For each product:
       a. ``SELECT … FOR UPDATE`` to acquire a row-level lock.
       b. Validate product exists and is active.
       c. Validate sufficient stock.
       d. Decrement ``stock_quantity``.
       e. Record ``unit_price`` from the current product price.
    5. Calculate ``total_amount``.
    6. Persist ``Order`` and ``OrderItem`` rows.
    7. Commit the SAVEPOINT.
    8. Return the order with eagerly loaded items.
    """

    # 1. Validate customer ------------------------------------------------
    customer = await session.get(Customer, data.customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {data.customer_id} not found",
        )

    # 2. Aggregate duplicate product_ids ----------------------------------
    aggregated: dict[UUID, int] = defaultdict(int)
    for item in data.items:
        aggregated[item.product_id] += item.quantity

    # 3-6. Transactional block --------------------------------------------
    async with session.begin_nested():
        order_items: list[OrderItem] = []
        total_amount = Decimal("0")

        for product_id, quantity in aggregated.items():
            # 4a. Row-level lock
            stmt = (
                select(Product)
                .where(Product.id == product_id)
                .with_for_update()
            )
            result = await session.execute(stmt)
            product = result.scalar_one_or_none()

            # 4b. Existence / active check
            if product is None or not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {product_id} not found or is inactive",
                )

            # 4c. Stock check
            if product.stock_quantity < quantity:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        f"Insufficient stock for product '{product.name}' "
                        f"(requested {quantity}, available {product.stock_quantity})"
                    ),
                )

            # 4d. Decrement stock
            product.stock_quantity -= quantity

            # 4e. Capture unit price
            unit_price = product.price
            line_total = unit_price * quantity
            total_amount += line_total

            order_items.append(
                OrderItem(
                    product_id=product_id,
                    quantity=quantity,
                    unit_price=unit_price,
                )
            )

        # 5-6. Persist order + items
        order = Order(
            customer_id=data.customer_id,
            total_amount=total_amount,
            status=OrderStatus.CONFIRMED,
            items=order_items,
        )
        session.add(order)

    # 7. Commit outer transaction
    await session.commit()

    # 8. Return with eager-loaded items -----------------------------------
    return await get_order(session, order.id)

async def delete_order(session: AsyncSession, order_id: UUID) -> None:
    """Cancel an order and restore stock quantities."""
    order = await get_order(session, order_id)
    if order.status == OrderStatus.CANCELLED:
        return
        
    async with session.begin_nested():
        for item in order.items:
            stmt = select(Product).where(Product.id == item.product_id).with_for_update()
            result = await session.execute(stmt)
            product = result.scalar_one_or_none()
            if product:
                product.stock_quantity += item.quantity
        order.status = OrderStatus.CANCELLED
    await session.commit()
