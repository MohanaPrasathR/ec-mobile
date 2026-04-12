'use client';

import { useState } from 'react';
import ProductCard from './components/ProductCard';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
};

const products: Product[] = [
  // Apple
  { id: '1', name: 'iPhone 15 Pro Max', price: 1199, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop', brand: 'Apple' },
  { id: '1b', name: 'iPhone 15', price: 799, image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop', brand: 'Apple' },
  { id: '1c', name: 'iPhone 14 Pro', price: 999, image: 'https://images.unsplash.com/photo-1605236453806-6ff3685e226e?q=80&w=600&auto=format&fit=crop', brand: 'Apple' },
  
  // Samsung
  { id: '2', name: 'Samsung Galaxy S24 Ultra', price: 1299, image: 'https://images.unsplash.com/photo-1707050361993-e4ff3f3feab6?q=80&w=600&auto=format&fit=crop', brand: 'Samsung' },
  { id: '2b', name: 'Samsung Galaxy Z Fold 5', price: 1799, image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600&auto=format&fit=crop', brand: 'Samsung' },
  { id: '2c', name: 'Samsung Galaxy S23', price: 699, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=600&auto=format&fit=crop', brand: 'Samsung' },
  
  // Google
  { id: '3', name: 'Google Pixel 8 Pro', price: 999, image: 'https://images.unsplash.com/photo-1698242491565-d017da1ed543?q=80&w=600&auto=format&fit=crop', brand: 'Google' },
  { id: '3b', name: 'Google Pixel 7a', price: 499, image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop', brand: 'Google' },
  { id: '3c', name: 'Google Pixel 8', price: 699, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=600&auto=format&fit=crop', brand: 'Google' },
  
  // OnePlus
  { id: '4', name: 'OnePlus 12', price: 799, image: 'https://images.unsplash.com/photo-1705608226487-73602fcb0200?q=80&w=600&auto=format&fit=crop', brand: 'OnePlus' },
  { id: '4b', name: 'OnePlus 11', price: 599, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop', brand: 'OnePlus' },
  { id: '4c', name: 'OnePlus 12R', price: 499, image: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=600&auto=format&fit=crop', brand: 'OnePlus' },
  
  // Xiaomi
  { id: '5', name: 'Xiaomi 14 Pro', price: 899, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop', brand: 'Xiaomi' },
  
  // Nothing
  { id: '6', name: 'Nothing Phone (2)', price: 599, image: 'https://images.unsplash.com/photo-1689006007234-79354714da91?q=80&w=600&auto=format&fit=crop', brand: 'Nothing' },
  { id: '6b', name: 'Nothing Phone (2a)', price: 349, image: 'https://images.unsplash.com/photo-1709425514605-654f59e66db5?q=80&w=600&auto=format&fit=crop', brand: 'Nothing' },
  
  // Sony
  { id: '7', name: 'Sony Xperia 1 V', price: 1399, image: 'https://images.unsplash.com/photo-1544244015-0cd4b3ff3f8d?q=80&w=600&auto=format&fit=crop', brand: 'Sony' },
];

export default function Home() {
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand)))];
  const filteredProducts = products.filter(p => {
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, ...formData })
      });
      
      const data = await res.json();
      if (data.success) {
        setIsCheckoutOpen(false);
        setCart([]);
        setShowSuccess(true);
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (err) {
      alert('An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <div className="brand">TechMobile FSD</div>
        <div className="search-container" style={{ flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
          <input 
            type="text" 
            placeholder="Search phones..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1px solid #30363d',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>
        <button className="cart-button" onClick={() => setIsCartOpen(true)}>
          Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
        </button>
      </header>

      <main>
        <section className="hero">
          <h1>Experience the Future.</h1>
          <p>Get the latest flagship devices delivered straight to your door.</p>
        </section>

        <section className="brand-filters" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', margin: '2rem 0', flexWrap: 'wrap', padding: '0 2rem' }}>
          {brands.map(brand => (
            <button 
              key={brand} 
              onClick={() => setSelectedBrand(brand)}
              style={{
                background: selectedBrand === brand ? '#0070f3' : 'transparent',
                color: selectedBrand === brand ? '#fff' : '#c9d1d9',
                border: '1px solid #30363d',
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: selectedBrand === brand ? 'bold' : 'normal'
              }}
              onMouseOver={(e) => { if(selectedBrand !== brand) e.currentTarget.style.borderColor = '#0070f3'; }}
              onMouseOut={(e) => { if(selectedBrand !== brand) e.currentTarget.style.borderColor = '#30363d'; }}
            >
              {brand}
            </button>
          ))}
        </section>

        <section className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart} 
            />
          ))}
        </section>

        <section className="testimonials" style={{ margin: '5rem 0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '3rem' }}>What Our Customers Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { name: 'Alex Johnson', text: 'The iPhone 15 Pro Max is incredible. Fast delivery and perfect condition.' },
              { name: 'Sarah Chen', text: 'Best price for the Galaxy S24 Ultra anywhere online. Very satisfied!' },
              { name: 'Michael Ross', text: 'Pixel 8 Pro has the best camera I have ever used. Great service from TechMobile.' }
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#8b949e' }}>"{t.text}"</p>
                <p style={{ fontWeight: 'bold', color: '#fff' }}>- {t.name}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsCartOpen(false)}>&times;</button>
            <h2>Your Cart</h2>
            
            {cart.length === 0 ? (
              <p style={{ marginTop: '1rem' }}>Your cart is empty.</p>
            ) : (
              <>
                <div style={{ marginTop: '1rem' }}>
                  {cart.map(item => (
                    <div key={item.product.id} className="cart-item">
                      <div>
                        <h4>{item.product.name}</h4>
                        <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Qty: {item.quantity} x ${item.product.price}</p>
                      </div>
                      <button 
                        style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span>Total:</span>
                  <span>${total}</span>
                </div>
                <button className="checkout-btn" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => !loading && setIsCheckoutOpen(false)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            {!loading && <button className="close-btn" onClick={() => setIsCheckoutOpen(false)}>&times;</button>}
            <h2>Secure Checkout</h2>
            <p style={{ color: '#8b949e', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Amount to pay: ${total}</p>
            
            {loading ? (
              <div className="loader"></div>
            ) : (
              <form onSubmit={handleCheckout}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input required type="text" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} placeholder="0000 0000 0000 0000" maxLength={19} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Expiry Date</label>
                    <input required type="text" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>CVC</label>
                    <input required type="text" value={formData.cvc} onChange={e => setFormData({...formData, cvc: e.target.value})} placeholder="123" maxLength={4} />
                  </div>
                </div>
                <button type="submit" className="checkout-btn" style={{ marginTop: '1rem' }}>
                  Pay ${total}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay" onClick={() => setShowSuccess(false)}>
          <div className="checkout-modal success-message" onClick={e => e.stopPropagation()}>
            <div className="success-icon">✓</div>
            <h2 style={{ marginBottom: '1rem' }}>Payment Successful!</h2>
            <p style={{ color: '#8b949e', marginBottom: '2rem' }}>Thank you for your purchase. Your order is being processed.</p>
            <button className="checkout-btn" onClick={() => setShowSuccess(false)}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <footer style={{ padding: '4rem 2rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', marginTop: '5rem', textAlign: 'center' }}>
        <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '1rem' }}>TechMobile FSD</p>
        <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>© 2026 TechMobile FSD. All rights reserved.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <a href="#" style={{ color: '#8b949e', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#8b949e', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</a>
          <a href="#" style={{ color: '#8b949e', textDecoration: 'none', fontSize: '0.9rem' }}>Support</a>
        </div>
      </footer>
    </>
  );
}
