'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard, { ProductType } from './components/ProductCard';
import ProductModal from './components/ProductModal';
import AddProductModal from './components/AddProductModal';
import OrdersModal from './components/OrdersModal';

export default function Home() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ product: ProductType; quantity: number }[]>([]);
  
  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  // Filters & Search
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Checkout Form & Feedback
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrand !== 'All') params.append('brand', selectedBrand);
      if (searchQuery) params.append('q', searchQuery);
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, searchQuery, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product: ProductType) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: ProductType; quantity: number }[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // only IDs and quantities are sent: the server looks up prices and checks stock
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.product._id, quantity: item.quantity })),
          name: checkoutData.name,
          email: checkoutData.email,
          address: checkoutData.address
        })
      });

      const data = await res.json();
      if (data.success) {
        setCart([]);
        setIsCheckoutOpen(false);
        showToast(`🎉 Order placed! Your order number is ${data.orderNumber}`, 'success');
        fetchProducts(); // refresh stock counts
      } else {
        showToast(data.error || 'Payment failed', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error processing checkout', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const brands = ['All', 'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing', 'Sony'];

  return (
    <div className="app-container">
      {/* Toast Banner */}
      {toastMessage && (
        <div className={`toast-notification ${toastMessage.type}`}>
          {toastMessage.text}
        </div>
      )}

      {/* Navigation Header */}
      <header>
        <div className="brand-logo" onClick={() => { setSelectedBrand('All'); setSearchQuery(''); }}>
          <span className="logo-icon">📱</span>
          <span className="brand">PhoneVault <small className="db-badge">MongoDB</small></span>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setIsAddModalOpen(true)}>
            + Add Phone
          </button>
          
          <button className="btn-secondary" onClick={() => setIsOrdersModalOpen(true)}>
            📜 Orders
          </button>

          <button className="cart-button" onClick={() => setIsCartOpen(true)}>
            🛒 Cart ({cartItemCount})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Banner */}
        <div className="hero">
          <h1>Next-Gen Smartphones Powered by MongoDB</h1>
          <p>Full-stack e-commerce application with dynamic MongoDB collections, search, specs inspection & order history.</p>

        </div>

        {/* Filter & Search Toolbar */}
        <div className="toolbar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by model, brand, processor, camera..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          <div className="sort-dropdown">
            <label>Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Brand Filter Tabs */}
        <div className="brand-tabs">
          {brands.map((b) => (
            <button
              key={b}
              className={`brand-tab ${selectedBrand === b ? 'active' : ''}`}
              onClick={() => setSelectedBrand(b)}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="loading-grid">
            <div className="spinner"></div>
            <p>Querying MongoDB Database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-db-banner">
            <h3>No phones match your search</h3>
            <p>Try a different brand or search term.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={addToCart}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Shopping Cart ({cartItemCount})</h3>
              <button className="modal-close" onClick={() => setIsCartOpen(false)}>×</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map(({ product, quantity }) => (
                    <div key={product._id} className="cart-item">
                      <img src={product.image} alt={product.name} className="cart-thumb" />
                      <div className="cart-item-details">
                        <h4>{product.name}</h4>
                        <div className="cart-item-price">${product.price}</div>
                        <div className="qty-controls">
                          <button onClick={() => updateQuantity(product._id, -1)}>-</button>
                          <span>{quantity}</span>
                          <button onClick={() => updateQuantity(product._id, 1)}>+</button>
                        </div>
                      </div>
                      <button className="btn-remove" onClick={() => removeFromCart(product._id)}>🗑️</button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="total-row">
                    <span>Total Amount:</span>
                    <strong>${cartTotal.toLocaleString()}</strong>
                  </div>
                  <button 
                    className="add-to-cart btn-large" 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsCheckoutOpen(false)}>×</button>
            <h3>Complete Your Purchase</h3>
            <p className="subtitle">Prices and stock are confirmed on the server when you place the order.</p>

            <form onSubmit={handleCheckoutSubmit} className="checkout-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Mohan Prasath" 
                  value={checkoutData.name}
                  onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  required 
                  placeholder="mohan@example.com" 
                  value={checkoutData.email}
                  onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Shipping Address *</label>
                <input 
                  type="text" 
                  required
                  minLength={10}
                  placeholder="Flat, street, city, PIN code" 
                  value={checkoutData.address}
                  onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                />
              </div>

              <p className="subtitle">Payment: cash on delivery. This is a demo store, so no card details are collected.</p>

              <div className="checkout-summary">
                <span>Order Total:</span>
                <strong>${cartTotal.toLocaleString()}</strong>
              </div>

              <button type="submit" className="add-to-cart btn-large" disabled={checkoutLoading}>
                {checkoutLoading ? 'Placing order…' : `Place order · $${cartTotal.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Specification Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={(newProd) => {
          showToast(`Successfully added ${newProd.name} to MongoDB!`);
          fetchProducts();
        }}
      />

      {/* Orders Modal */}
      <OrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />

      {/* Footer */}
      <footer>
        <p>© {new Date().getFullYear()} PhoneVault · Next.js + MongoDB</p>
      </footer>
    </div>
  );
}
