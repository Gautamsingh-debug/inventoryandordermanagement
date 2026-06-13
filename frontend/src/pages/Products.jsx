import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import useProducts from '../hooks/useProducts';
import { useToast } from '../components/Toast/Toast';
import DataTable from '../components/DataTable/DataTable';
import Modal from '../components/Modal/Modal';
import './Products.css';

const emptyForm = { name: '', sku: '', description: '', price: '', stock_quantity: '' };

const Products = () => {
  const { products, loading, addProduct, editProduct, removeProduct, fetchProducts } = useProducts();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity, 10),
    };

    if (editing) {
      const { error } = await editProduct(editing.id, payload);
      if (error) {
        showToast(error, 'error');
      } else {
        showToast('Product updated', 'success');
        setModalOpen(false);
        fetchProducts();
      }
    } else {
      const { error } = await addProduct(payload);
      if (error) {
        showToast(error, 'error');
      } else {
        showToast('Product created', 'success');
        setModalOpen(false);
        fetchProducts();
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await removeProduct(confirmDelete.id);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Product archived', 'success');
      fetchProducts();
    }
    setConfirmDelete(null);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.name}</span> },
    { key: 'sku', label: 'SKU', render: (row) => <code className="sku-code">{row.sku}</code> },
    { key: 'price', label: 'Price', render: (row) => <span className="text-money">${Number(row.price).toFixed(2)}</span> },
    {
      key: 'stock_quantity',
      label: 'Stock',
      render: (row) => (
        <span className={`badge ${row.stock_quantity === 0 ? 'badge-danger' : row.stock_quantity < 10 ? 'badge-warning' : 'badge-success'}`}>
          {row.stock_quantity}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.is_active ? 'badge-success' : 'badge-danger'}`}>
          <span className="badge-dot" />
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="td-actions">
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(row)} title="Edit">
            <Pencil size={15} />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setConfirmDelete(row)} title="Archive" style={{ color: 'var(--danger)' }}>
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No products found" />

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input className="form-input" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price *</label>
              <input className="form-input" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input className="form-input" type="number" min="0" required value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Archive Product" size="sm">
        <p className="confirm-text">
          Are you sure you want to archive <strong>{confirmDelete?.name}</strong>? It will no longer appear in active listings.
        </p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Archive</button>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
