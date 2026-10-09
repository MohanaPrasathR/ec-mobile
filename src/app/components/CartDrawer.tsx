'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE, ProductType, usd } from './ProductCard';

export type CartLine = { product: ProductType; quantity: number };

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartLine[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  /** Resolves with the order number, or throws with a message for the shopper. */
  onCheckout: (details: { name: string; email: string; address: string }) => Promise<string>;
}

type Step = 'bag' | 'details' | 'done';

export default function CartDrawer({ isOpen, cart, onClose, onUpdateQuantity, onRemove, onCheckout }: CartDrawerProps) {
  const [step, setStep] = useState<Step>('bag');
  const [details, setDetails] = useState({ name: '', email: '', address: '' });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Start from the bag again the next time the drawer opens after an order
  useEffect(() => {
    if (!isOpen && step === 'done') setStep('bag');
  }, [isOpen, step]);

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setError('');
    try {
      setOrderNumber(await onCheckout(details));
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place the order. Try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="overlay right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="drawer-head">
              <h3>{step === 'bag' ? `Your bag${count ? ` (${count})` : ''}` : step === 'details' ? 'Delivery details' : 'Order placed'}</h3>
              <button className="icon-btn" onClick={onClose} aria-label="Close bag">✕</button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {step === 'done' ? (
                <motion.div key="done" className="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="success-mark" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
                    <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.25 }} />
                    </svg>
                  </motion.div>
                  <h4>Thanks, {details.name.split(' ')[0]}</h4>
                  <p style={{ color: 'var(--ink-2)' }}>Your order is in. Pay when it arrives.</p>
                  <div className="order-no">{orderNumber}</div>
                  <button className="btn btn-dark" onClick={onClose}>Keep shopping</button>
                </motion.div>
              ) : cart.length === 0 ? (
                <motion.div key="empty" className="drawer-body" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="cart-empty">
                    <h4>Your bag is empty</h4>
                    <p>Pick a phone and it will show up here.</p>
                    <button className="btn btn-dark" onClick={onClose} style={{ marginTop: 8 }}>Browse phones</button>
                  </div>
                </motion.div>
              ) : step === 'bag' ? (
                <motion.div key="bag" style={{ display: 'contents' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <div className="drawer-body">
                    <AnimatePresence initial={false}>
                      {cart.map(({ product, quantity }) => (
                        <motion.div
                          key={product._id}
                          layout
                          className="line-item"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 60, height: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        >
                          <img src={product.image} alt="" />
                          <div>
                            <h4>{product.name}</h4>
                            <div className="unit">{usd(product.price)} each</div>
                            <div className="stepper">
                              <button onClick={() => onUpdateQuantity(product._id, -1)} aria-label={`One fewer ${product.name}`}>−</button>
                              <span aria-live="polite">{quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(product._id, 1)}
                                disabled={product.stock !== undefined && quantity >= product.stock}
                                aria-label={`One more ${product.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className="line-total">{usd(product.price * quantity)}</div>
                            <button className="remove" onClick={() => onRemove(product._id)}>Remove</button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="drawer-foot">
                    <div className="total-row">
                      <span>Total</span>
                      <strong>{usd(total)}</strong>
                    </div>
                    <motion.button whileTap={{ scale: 0.98 }} className="btn btn-blue btn-block" onClick={() => setStep('details')}>
                      Check out
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="details" onSubmit={submit} style={{ display: 'contents' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                  <div className="drawer-body">
                    <button type="button" className="link" style={{ margin: '14px 0 0', fontSize: 14 }} onClick={() => setStep('bag')}>← Back to bag</button>
                    <div className="form">
                      {error && <div className="alert" role="alert">{error}</div>}
                      <div className="field">
                        <label htmlFor="co-name">Full name</label>
                        <input id="co-name" type="text" required autoComplete="name" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
                      </div>
                      <div className="field">
                        <label htmlFor="co-email">Email</label>
                        <input id="co-email" type="email" required autoComplete="email" placeholder="name@example.com" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} />
                      </div>
                      <div className="field">
                        <label htmlFor="co-address">Delivery address</label>
                        <textarea id="co-address" required minLength={10} rows={3} autoComplete="street-address" placeholder="Flat, street, city, PIN code" value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} />
                      </div>
                      <p className="fine">
                        Cash on delivery. This is a demo store, so no card details are collected. Prices and stock are confirmed on the server when you place the order.
                      </p>
                    </div>
                  </div>
                  <div className="drawer-foot">
                    <div className="total-row">
                      <span>{count} item{count === 1 ? '' : 's'}</span>
                      <strong>{usd(total)}</strong>
                    </div>
                    <motion.button whileTap={{ scale: 0.98 }} type="submit" className="btn btn-blue btn-block" disabled={placing}>
                      {placing ? 'Placing order…' : `Place order · ${usd(total)}`}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
