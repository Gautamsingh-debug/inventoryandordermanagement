import client from './client';

/**
 * Fetch a paginated list of orders.
 * @param {Object} [params] - Query parameters (skip, limit).
 */
export const getOrders = async (params) => {
  const response = await client.get('/orders', { params });
  return response.data;
};

/**
 * Fetch a single order by ID.
 * @param {number|string} id
 */
export const getOrder = async (id) => {
  const response = await client.get(`/orders/${id}`);
  return response.data;
};

/**
 * Create a new order.
 * @param {Object} data - Order payload: { customer_id, items: [{ product_id, quantity }] }
 */
export const createOrder = async (data) => {
  const response = await client.post('/orders', data);
  return response.data;
};

/**
 * Cancel/delete an order by ID.
 * @param {number|string} id
 */
export const deleteOrder = async (id) => {
  const response = await client.delete(`/orders/${id}`);
  return response.data;
};
