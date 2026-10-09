'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getAdminKey, setAdminKey } from '@/lib/adminKey';
import { EASE, usd } from './ProductCard';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Orders"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <button className="icon-btn close" onClick={onClose} aria-label="Close">✕</button>
            <h3>Orders</h3>
            <p className="sub">Store staff only: order history includes customer contact details.</p>

            <form className="form" onSubmit={(e) => { e.preventDefault(); fetchOrders(); }}>
              <div className="field">
                <label htmlFor="orders-admin-key">Admin key</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input id="orders-admin-key" type="password" autoComplete="off" value={adminKey} onChange={(e) => setKey(e.target.value)} placeholder="Set by ADMIN_API_KEY on the server" />
                  <button type="submit" className="btn btn-dark" disabled={loading}>{loading ? 'Loading…' : 'Load'}</button>
                </div>
              </div>
            </form>

            {error ? (
              <div className="alert" role="alert" style={{ marginTop: 16 }}>{error}</div>
            ) : !loading && orders.length === 0 ? (
              <p className="sub" style={{ marginTop: 20 }}>No orders to show yet.</p>
            ) : (
              <div className="orders">
                {orders.map((order, i) => (
                  <motion.div key={order._id} className="order" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}>
                    <div className="order-top">
                      <div>
                        <b>{order.orderNumber}</b>
                        <small>{new Date(order.createdAt).toLocaleString()}</small>
                      </div>
                      <span className="status">{order.status}</span>
                    </div>
                    <div className="order-who">{order.customerName} · {order.customerEmail}</div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-line">
                        <img src={item.image} alt="" />
                        <span>{item.name}</span>
                        <span>{item.quantity} × {usd(item.price)}</span>
                      </div>
                    ))}
                    <div className="order-sum">
                      <span>Total</span>
                      <span>{usd(order.total)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
