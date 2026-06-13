import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import useCustomers from '../hooks/useCustomers';
import { useToast } from '../components/Toast/Toast';
import DataTable from '../components/DataTable/DataTable';
import Modal from '../components/Modal/Modal';

const emptyForm = { name: '', email: '', phone: '', address: '' };

const Customers = () => {
  const { customers, loading, addCustomer, editCustomer, removeCustomer, fetchCustomers } = useCustomers();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form };
    if (!payload.phone) delete payload.phone;
    if (!payload.address) delete payload.address;

    if (editing) {
      const { error } = await editCustomer(editing.id, payload);
      if (error) {
        showToast(error, 'error');
      } else {
        showToast('Customer updated', 'success');
        setModalOpen(false);
        fetchCustomers();
      }
    } else {
      const { error } = await addCustomer(payload);
      if (error) {
        showToast(error, 'error');
      } else {
        showToast('Customer created', 'success');
        setModalOpen(false);
        fetchCustomers();
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await removeCustomer(confirmDelete.id);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Customer deleted', 'success');
      fetchCustomers();
    }
    setConfirmDelete(null);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.name}</span> },
    { key: 'email', label: 'Email', render: (row) => <span style={{ color: 'var(--accent-primary)' }}>{row.email}</span> },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || <span style={{ color: 'var(--text-muted)' }}>—</span> },
    { key: 'address', label: 'Address', render: (row) => row.address || <span style={{ color: 'var(--text-muted)' }}>—</span> },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="td-actions">
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(row)} title="Edit">
            <Pencil size={15} />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setConfirmDelete(row)} title="Delete" style={{ color: 'var(--danger)' }}>
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
          <h1>Customers</h1>
          <p>Manage your customer base</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No customers found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Customer" size="sm">
        <p className="confirm-text">
          Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? This action cannot be undone.
          {' '}Customers with existing orders cannot be deleted.
        </p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
