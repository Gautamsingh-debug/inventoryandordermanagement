import client from './client';

/**
 * Fetch a paginated list of products.
 * @param {Object} [params] - Query parameters (skip, limit, active_only).
 */
export const getProducts = async (params) => {
  const response = await client.get('/products', { params });
  return response.data;
};

/**
 * Fetch a single product by ID.
 * @param {number|string} id
 */
export const getProduct = async (id) => {
  const response = await client.get(`/products/${id}`);
  return response.data;
};

/**
 * Create a new product.
 * @param {Object} data - Product payload.
 */
export const createProduct = async (data) => {
  const response = await client.post('/products', data);
  return response.data;
};

/**
 * Partially update an existing product.
 * @param {number|string} id
 * @param {Object} data - Fields to update.
 */
export const updateProduct = async (id, data) => {
  const response = await client.patch(`/products/${id}`, data);
  return response.data;
};

/**
 * Delete a product by ID.
 * @param {number|string} id
 */
export const deleteProduct = async (id) => {
  const response = await client.delete(`/products/${id}`);
  return response.data;
};
