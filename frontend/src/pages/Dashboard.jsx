import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import useProducts from '../hooks/useProducts';
import useCustomers from '../hooks/useCustomers';
import useOrders from '../hooks/useOrders';
import DataTable from '../components/DataTable/DataTable';
import StatusBadge from '../components/StatusBadge/StatusBadge';
import OrderDetailModal from '../components/OrderDetailModal/OrderDetailModal';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [detailOrder, setDetailOrder] = useState(null);
  const { products, loading: pLoading } = useProducts();
  const { customers, loading: cLoading } = useCustomers();
  const { orders, loading: oLoading } = useOrders();

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[p.id] = p; });
    return map;
  }, [products]);

  const loading = pLoading || cLoading || oLoading;
  const lowStock = products.filter((p) => p.is_active && p.stock_quantity < 10);
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  const stats = [
    { icon: Package, label: 'Total Products', value: products.filter(p => p.is_active).length, color: 'indigo', path: '/products' },
    { icon: Users, label: 'Total Customers', value: customers.length, color: 'emerald', path: '/customers' },
    { icon: ShoppingCart, label: 'Total Orders', value: orders.length, color: 'amber', path: '/orders' },
    { icon: AlertTriangle, label: 'Low Stock Items', value: lowStock.length, color: 'rose', path: '/products' },
  ];

  const orderColumns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (row) => <code className="order-id">{row.id?.slice(0, 8)}…</code>,
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
      key: 'items',
      label: 'Items',
      render: (row) => row.items?.length || 0,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const lowStockColumns = [
    { key: 'name', label: 'Product' },
    { key: 'sku', label: 'SKU', render: (row) => <code>{row.sku}</code> },
    {
      key: 'stock_quantity',
      label: 'Stock',
      render: (row) => (
        <span className={`badge ${row.stock_quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
          {row.stock_quantity} left
        </span>
      ),
    },
  ];

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard</h1>
          <p>Overview of your inventory and orders</p>
        </div>
      </div>

      <div className="grid grid-cols-4 dashboard-stats">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="stat-card stat-card-clickable" 
            onClick={() => navigate(stat.path)}
          >
            <div className={`stat-card-icon ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div className="stat-card-value">
              {loading ? <div className="skeleton" /> : stat.value}
            </div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 dashboard-sections">
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Orders</h2>
          </div>
          <DataTable
            columns={orderColumns}
            data={recentOrders}
            loading={oLoading}
            emptyMessage="No orders yet"
            onRowClick={(row) => setDetailOrder(row)}
          />
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Low Stock Alerts</h2>
          </div>
          <DataTable
            columns={lowStockColumns}
            data={lowStock}
            loading={pLoading}
            emptyMessage="All products are well-stocked"
            onRowClick={() => navigate('/products')}
          />
        </div>
      </div>

      <OrderDetailModal 
        detailOrder={detailOrder} 
        onClose={() => setDetailOrder(null)} 
        productMap={productMap} 
      />
    </div>
  );
};

export default Dashboard;
