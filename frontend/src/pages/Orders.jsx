import { useState, useMemo } from 'react';
import { Plus, X, Eye } from 'lucide-react';
import useOrders from '../hooks/useOrders';
import useProducts from '../hooks/useProducts';
import useCustomers from '../hooks/useCustomers';
import { useToast } from '../components/Toast/Toast';
import DataTable from '../components/DataTable/DataTable';
import Modal from '../components/Modal/Modal';
import StatusBadge from '../components/StatusBadge/StatusBadge';
import './Orders.css';

const Orders = () => {
  const { orders, loading, placeOrder, fetchOrders, cancelOrder } = useOrders();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  const activeProducts = useMemo(() => products.filter((p) => p.is_active), [products]);

  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => { map[c.id] = c; });
    return map;
  }, [customers]);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[p.id] = p; });
    return map;
  }, [products]);

  const runningTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = productMap[item.product_id];
      if (product && item.quantity > 0) {
        return sum + Number(product.price) * item.quantity;
      }
      return sum;
    }, 0);
  }, [items, productMap]);

  const openPlace = () => {
    setCustomerId('');
    setItems([{ product_id: '', quantity: 1 }]);
    setModalOpen(true);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (idx) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: field === 'quantity' ? parseInt(value, 10) || 0 : value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.product_id && i.quantity > 0);
    if (!validItems.length) {
      showToast('Add at least one item', 'error');
      return;
    }
    setSubmitting(true);
    const { error } = await placeOrder({ customer_id: customerId, items: validItems });
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Order placed successfully!', 'success');
      setModalOpen(false);
      fetchOrders();
    }
    setSubmitting(false);
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (row) => <code className="order-id">{row.id?.slice(0, 8)}…</code>,
    },
    {
      key: 'customer_id',
      label: 'Customer',
      render: (row) => {
        const c = customerMap[row.customer_id];
        return c ? c.name : <span style={{ color: 'var(--text-muted)' }}>{row.customer_id?.slice(0, 8)}…</span>;
      },
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (row) => <span className="text-money">${Number(row.total_amount).toFixed(2)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'items_count',
      label: 'Items',
      render: (row) => row.items?.length || 0,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDetailOrder(row)} title="View Details">
            <Eye size={15} />
          </button>
          {row.status !== 'CANCELLED' && (
            <button 
              className="btn btn-ghost btn-sm btn-icon" 
              onClick={async () => {
                if(window.confirm('Are you sure you want to cancel this order?')) {
                  const { error } = await cancelOrder(row.id);
                  if (error) showToast(error, 'error');
                  else showToast('Order cancelled', 'success');
                }
              }} 
              title="Cancel Order"
              style={{ color: 'var(--danger)' }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Orders</h1>
          <p>View and place orders</p>
        </div>
        <button className="btn btn-primary" onClick={openPlace}>
          <Plus size={18} /> Place Order
        </button>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} emptyMessage="No orders yet" />

      {/* Place Order Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Place New Order" size="lg">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select className="form-input form-select" required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Order Items *</label>
            <div className="order-items-list">
              {items.map((item, idx) => {
                const selectedProduct = productMap[item.product_id];
                return (
                  <div key={idx} className="order-item-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <select
                        className="form-input form-select"
                        value={item.product_id}
                        onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                        required
                      >
                        <option value="">Select product…</option>
                        {activeProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.stock_quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      {selectedProduct && (
                        <span className="item-price">${Number(selectedProduct.price).toFixed(2)} ea</span>
                      )}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        max={selectedProduct?.stock_quantity || 999}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      style={{ color: 'var(--danger)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginTop: 'var(--space-sm)' }}>
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div className="order-total">
            <span>Total:</span>
            <span>${runningTotal.toFixed(2)}</span>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Placing…' : 'Place Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Order Detail Modal */}
      <Modal isOpen={!!detailOrder} onClose={() => setDetailOrder(null)} title="Order Details" size="md">
        {detailOrder && (
          <div className="order-detail">
            <div className="order-detail-header">
              <div>
                <span className="form-label">Order ID</span>
                <div><code className="order-id">{detailOrder.id}</code></div>
              </div>
              <div>
                <span className="form-label">Status</span>
                <div><StatusBadge status={detailOrder.status} /></div>
              </div>
              <div>
                <span className="form-label">Date</span>
                <div style={{ color: 'var(--text-primary)' }}>{new Date(detailOrder.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="table-container" style={{ marginTop: 'var(--space-md)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items?.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.product_name || productMap[item.product_id]?.name || item.product_id?.slice(0, 8)}
                      </td>
                      <td>{item.quantity}</td>
                      <td>${Number(item.unit_price).toFixed(2)}</td>
                      <td className="text-money">${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="order-total">
              <span>Total:</span>
              <span>${Number(detailOrder.total_amount).toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
