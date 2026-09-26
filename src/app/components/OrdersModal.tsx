'use client';

import { useEffect, useState } from 'react';
import { getAdminKey, setAdminKey } from '@/lib/adminKey';

type OrderType = {
  _id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress?: { address?: string };
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
};

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrdersModal({ isOpen, onClose }: OrdersModalProps) {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminKey, setKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = getAdminKey();
      setKey(saved);
      if (saved) fetchOrders(saved);
    }
  }, [isOpen]);

  const fetchOrders = async (key = adminKey) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', { headers: { 'x-admin-key': key } });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setAdminKey(key);
      } else {
        if (res.status === 401) setAdminKey('');
        setError(data.error || 'Could not fetch orders from database.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content orders-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="orders-header">
          <h3>📦 MongoDB Orders History</h3>
          <button className="btn-icon" onClick={() => fetchOrders()} title="Refresh orders">🔄 Refresh</button>
        </div>
        <p className="subtitle">Store staff only: order history includes customer contact details.</p>
        <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); fetchOrders(); }}>
          <div className="form-group">
            <label htmlFor="orders-admin-key">Admin key</label>
            <input id="orders-admin-key" type="password" autoComplete="off" value={adminKey}
              onChange={(e) => setKey(e.target.value)} placeholder="Set by ADMIN_API_KEY on the server" />
          </div>
        </form>

        {loading ? (
          <div className="loading-spinner">Loading orders from MongoDB...</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders recorded in MongoDB yet.</p>
            <p className="small">Add products to cart and checkout to create your first order!</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-receipt">{order.orderNumber}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                </div>

                <div className="order-customer">
                  <strong>Customer:</strong> {order.customerName} ({order.customerEmail})
                </div>

                <div className="order-items-grid">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <img src={item.image} alt={item.name} className="order-item-thumb" />
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">Qty: {item.quantity} × ${item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <span>Total Amount Paid:</span>
                  <strong className="order-total-price">${order.total.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
