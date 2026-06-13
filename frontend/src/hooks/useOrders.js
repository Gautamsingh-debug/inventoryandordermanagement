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
      setError(err.message ?? 'Failed to fetch orders');
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
