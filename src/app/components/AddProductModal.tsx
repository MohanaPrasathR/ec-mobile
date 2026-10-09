'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getAdminKey, setAdminKey } from '@/lib/adminKey';
import { EASE, ProductType } from './ProductCard';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProduct: ProductType) => void;
}

const BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing', 'Sony'];

const EMPTY_FORM = {
  name: '',
  brand: 'Apple',
  price: '',
  image: '',
  description: '',
  ram: '12GB',
  storage: '256GB',
  battery: '5000 mAh',
  camera: '50 MP Triple Camera',
  display: '6.7" OLED 120Hz',
  stock: '10'
};

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminKey, setKey] = useState(() => (typeof window === 'undefined' ? '' : getAdminKey()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          price: Number(form.price),
          image: form.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
          description: form.description,
          specs: {
            ram: form.ram,
            storage: form.storage,
            battery: form.battery,
            camera: form.camera,
            display: form.display
          },
          stock: Number(form.stock)
        })
      });

      const data = await res.json();
      if (data.success) {
        setAdminKey(adminKey);
        onProductAdded(data.data);
        onClose();
        setForm(EMPTY_FORM);
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof EMPTY_FORM) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Add a new phone"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <button className="icon-btn close" onClick={onClose} aria-label="Close">✕</button>
            <h3>Add a new phone</h3>
            <p className="sub">Store staff only. Requires the admin key configured on the server.</p>

            <form onSubmit={handleSubmit} className="form">
              {error && <div className="alert" role="alert">{error}</div>}
              <div className="field">
                <label htmlFor="add-admin-key">Admin key</label>
                <input id="add-admin-key" type="password" required autoComplete="off" value={adminKey} onChange={(e) => setKey(e.target.value)} />
              </div>
              <div className="row">
                <div className="field">
                  <label htmlFor="add-name">Phone name</label>
                  <input id="add-name" type="text" placeholder="Galaxy S25 Ultra" required {...field('name')} />
                </div>
                <div className="field">
                  <label htmlFor="add-brand">Brand</label>
                  <select id="add-brand" {...field('brand')}>
                    {BRANDS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label htmlFor="add-price">Price (USD)</label>
                  <input id="add-price" type="number" min="1" placeholder="999" required {...field('price')} />
                </div>
                <div className="field">
                  <label htmlFor="add-stock">Initial stock</label>
                  <input id="add-stock" type="number" min="0" {...field('stock')} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="add-image">Image URL</label>
                <input id="add-image" type="url" placeholder="https://images.unsplash.com/..." {...field('image')} />
              </div>
              <div className="field">
                <label htmlFor="add-desc">Description</label>
                <textarea id="add-desc" placeholder="Key features, processor, design notes" rows={3} {...field('description')} />
              </div>

              <div className="form-title">Hardware</div>
              <div className="row three">
                <div className="field">
                  <label htmlFor="add-ram">RAM</label>
                  <input id="add-ram" type="text" {...field('ram')} />
                </div>
                <div className="field">
                  <label htmlFor="add-storage">Storage</label>
                  <input id="add-storage" type="text" {...field('storage')} />
                </div>
                <div className="field">
                  <label htmlFor="add-battery">Battery</label>
                  <input id="add-battery" type="text" {...field('battery')} />
                </div>
              </div>

              <div className="actions">
                <button type="button" className="btn btn-line" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-blue" disabled={loading}>{loading ? 'Saving…' : 'Save phone'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
