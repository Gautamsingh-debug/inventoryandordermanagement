"""Orders router — RESTful endpoints for order management & inventory engine."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.order import OrderCreate, OrderRead, OrderItemRead
from app.services import order_service

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def _order_to_read(order) -> OrderRead:
    """Map an Order ORM instance to an OrderRead schema.

    Handles the denormalised ``product_name`` on each item by pulling it
    from the eagerly loaded ``item.product`` relationship.
    """
    items = [
        OrderItemRead(
            id=item.id,
            order_id=item.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            product_name=item.product.name if item.product else None,
        )
        for item in order.items
    ]
    return OrderRead(
        id=order.id,
        customer_id=order.customer_id,
        total_amount=order.total_amount,
        status=order.status.value if hasattr(order.status, "value") else str(order.status),
        items=items,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.get("", response_model=list[OrderRead])
async def list_orders(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    session: AsyncSession = Depends(get_db),
) -> list[OrderRead]:
    """Return a paginated list of orders with their items."""
    orders = await order_service.get_orders(session, skip=skip, limit=limit)
    return [_order_to_read(o) for o in orders]


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> OrderRead:
    """Return a single order with its items."""
    order = await order_service.get_order(session, order_id)
    return _order_to_read(order)


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    session: AsyncSession = Depends(get_db),
) -> OrderRead:
    """Place a new order — triggers the inventory engine."""
    order = await order_service.create_order(session, data)
    return _order_to_read(order)


@router.delete("/{order_id}")
async def delete_order(
    order_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> Response:
    """Cancel an order and restore stock."""
    await order_service.delete_order(session, order_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
