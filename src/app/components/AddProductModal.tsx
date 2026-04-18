'use client';

import { useState } from 'react';
import { ProductType } from './ProductCard';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProduct: ProductType) => void;
}

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [form, setForm] = useState({
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        onProductAdded(data.data);
        onClose();
        setForm({
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
        });
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Add New Smartphone to MongoDB</h3>
        <p className="subtitle">Fill out details to save a new product document directly to your MongoDB database.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Phone Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Galaxy S25 Ultra" 
                required 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Brand *</label>
              <select 
                value={form.brand} 
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              >
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Google">Google</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Xiaomi">Xiaomi</option>
                <option value="Nothing">Nothing</option>
                <option value="Sony">Sony</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price ($ USD) *</label>
              <input 
                type="number" 
                placeholder="e.g. 999" 
                required 
                value={form.price} 
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Initial Stock</label>
              <input 
                type="number" 
                placeholder="10" 
                value={form.stock} 
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input 
              type="url" 
              placeholder="https://images.unsplash.com/..." 
              value={form.image} 
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              placeholder="Key features, processor, design notes..." 
              rows={3} 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="form-section-title">Hardware Specifications</div>
          <div className="form-row three-col">
            <div className="form-group">
              <label>RAM</label>
              <input 
                type="text" 
                value={form.ram} 
                onChange={(e) => setForm({ ...form, ram: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Storage</label>
              <input 
                type="text" 
                value={form.storage} 
                onChange={(e) => setForm({ ...form, storage: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Battery</label>
              <input 
                type="text" 
                value={form.battery} 
                onChange={(e) => setForm({ ...form, battery: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="add-to-cart" disabled={loading}>
              {loading ? 'Saving to MongoDB...' : 'Save Product to DB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Refactored logic pass: rev 14
