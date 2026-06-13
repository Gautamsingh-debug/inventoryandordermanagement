import client from './client';

/**
 * Fetch a paginated list of customers.
 * @param {Object} [params] - Query parameters (skip, limit).
 */
export const getCustomers = async (params) => {
  const response = await client.get('/customers', { params });
  return response.data;
};

/**
 * Fetch a single customer by ID.
 * @param {number|string} id
 */
export const getCustomer = async (id) => {
  const response = await client.get(`/customers/${id}`);
  return response.data;
};

/**
 * Create a new customer.
 * @param {Object} data - Customer payload.
 */
export const createCustomer = async (data) => {
  const response = await client.post('/customers', data);
  return response.data;
};

/**
 * Partially update an existing customer.
 * @param {number|string} id
 * @param {Object} data - Fields to update.
 */
export const updateCustomer = async (id, data) => {
  const response = await client.patch(`/customers/${id}`, data);
  return response.data;
};

/**
 * Delete a customer by ID.
 * @param {number|string} id
 */
export const deleteCustomer = async (id) => {
  const response = await client.delete(`/customers/${id}`);
  return response.data;
};
