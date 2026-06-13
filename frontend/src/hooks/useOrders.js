import { useState, useEffect, useCallback } from 'react';
import { getOrders as fetchOrdersApi, createOrder, deleteOrder as deleteOrderApi } from '../api/orders';

/**
 * Custom hook for managing order data.
 *
 * @returns {{
 *   orders: Array,
 *   loading: boolean,
 *   error: string|null,
 *   fetchOrders: (params?: Object) => Promise<void>,
 *   placeOrder: (data: Object) => Promise<{ order?: Object, error?: string }>,
 * }}
 */
const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrdersApi(params);
      setOrders(data);
    } catch (err) {
      console.error(err);
      // Fallback to mock data for UI demonstration since backend isn't running
      setOrders([
        {
          id: 'mock-order-1',
          customer_id: 'mock-cust-1',
          total_amount: 150.00,
          status: 'PENDING',
          created_at: new Date().toISOString(),
          items: [
            { id: 'item-1', product_id: 'prod-1', product_name: 'Mock Product A', quantity: 2, unit_price: 50.00 },
            { id: 'item-2', product_id: 'prod-2', product_name: 'Mock Product B', quantity: 1, unit_price: 50.00 }
          ]
        }
      ]);
      setError('Backend unavailable. Using mock data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = useCallback(async (data) => {
    try {
      const order = await createOrder(data);
      setOrders((prev) => [...prev, order]);
      return { order };
    } catch (err) {
      return { error: err.message ?? 'Failed to place order' };
    }
  }, []);

  const cancelOrder = useCallback(async (id) => {
    try {
      await deleteOrderApi(id);
      fetchOrders();
      return {};
    } catch (err) {
      return { error: err.message ?? 'Failed to cancel order' };
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, fetchOrders, placeOrder, cancelOrder };
};

export default useOrders;
