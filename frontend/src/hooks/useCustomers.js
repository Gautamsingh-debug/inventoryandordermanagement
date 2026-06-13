import { useState, useEffect, useCallback } from 'react';
import {
  getCustomers as fetchCustomersApi,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../api/customers';

/**
 * Custom hook for managing customer data.
 *
 * @returns {{
 *   customers: Array,
 *   loading: boolean,
 *   error: string|null,
 *   fetchCustomers: (params?: Object) => Promise<void>,
 *   addCustomer: (data: Object) => Promise<{ customer?: Object, error?: string }>,
 *   editCustomer: (id: number|string, data: Object) => Promise<{ customer?: Object, error?: string }>,
 *   removeCustomer: (id: number|string) => Promise<{ success?: boolean, error?: string }>,
 * }}
 */
const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomersApi(params);
      setCustomers(data);
    } catch (err) {
      setError(err.message ?? 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = useCallback(async (data) => {
    try {
      const customer = await createCustomer(data);
      setCustomers((prev) => [...prev, customer]);
      return { customer };
    } catch (err) {
      return { error: err.message ?? 'Failed to create customer' };
    }
  }, []);

  const editCustomer = useCallback(async (id, data) => {
    try {
      const customer = await updateCustomer(id, data);
      setCustomers((prev) => prev.map((c) => (c.id === id ? customer : c)));
      return { customer };
    } catch (err) {
      return { error: err.message ?? 'Failed to update customer' };
    }
  }, []);

  const removeCustomer = useCallback(async (id) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      return { success: true };
    } catch (err) {
      return { error: err.message ?? 'Failed to delete customer' };
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, error, fetchCustomers, addCustomer, editCustomer, removeCustomer };
};

export default useCustomers;
