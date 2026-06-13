import { useState, useEffect, useCallback } from 'react';
import {
  getProducts as fetchProductsApi,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/products';

/**
 * Custom hook for managing product data.
 *
 * @returns {{
 *   products: Array,
 *   loading: boolean,
 *   error: string|null,
 *   fetchProducts: (params?: Object) => Promise<void>,
 *   addProduct: (data: Object) => Promise<{ product?: Object, error?: string }>,
 *   editProduct: (id: number|string, data: Object) => Promise<{ product?: Object, error?: string }>,
 *   removeProduct: (id: number|string) => Promise<{ success?: boolean, error?: string }>,
 * }}
 */
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductsApi(params);
      setProducts(data);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (data) => {
    try {
      const product = await createProduct(data);
      setProducts((prev) => [...prev, product]);
      return { product };
    } catch (err) {
      return { error: err.message ?? 'Failed to create product' };
    }
  }, []);

  const editProduct = useCallback(async (id, data) => {
    try {
      const product = await updateProduct(id, data);
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
      return { product };
    } catch (err) {
      return { error: err.message ?? 'Failed to update product' };
    }
  }, []);

  const removeProduct = useCallback(async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      return { error: err.message ?? 'Failed to delete product' };
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, fetchProducts, addProduct, editProduct, removeProduct };
};

export default useProducts;
