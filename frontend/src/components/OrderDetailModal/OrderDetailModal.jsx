import React from 'react';
import Modal from '../Modal/Modal';
import StatusBadge from '../StatusBadge/StatusBadge';

const OrderDetailModal = ({ detailOrder, onClose, productMap = {} }) => {
  return (
    <Modal isOpen={!!detailOrder} onClose={onClose} title="Order Details" size="md">
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
  );
};

export default OrderDetailModal;
