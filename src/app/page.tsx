'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useScroll, useTransform } from 'framer-motion';
import ProductCard, { EASE, ProductType, usd } from './components/ProductCard';
import ProductModal from './components/ProductModal';
import AddProductModal from './components/AddProductModal';
import OrdersModal from './components/OrdersModal';
import CartDrawer, { CartLine } from './components/CartDrawer';

const BRANDS = ['All', 'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Nothing', 'Sony'];

const PROMISES = [
  { title: 'Live stock', text: 'Every card shows what is actually left. The last unit can only be bought once.' },
  { title: 'Honest totals', text: 'Your order is priced on the server from the catalogue, never from the browser.' },
  { title: 'Pay on delivery', text: 'No card details collected. This is a demo store, so nothing ships either.' },
];

export default function Home() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [featured, setFeatured] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  // Filters & Search
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [toast, setToast] = useState<{ id: number; text: string; type: 'success' | 'error' } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroRotate = useTransform(scrollYProgress, [0, 1], [0, 6]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToast({ id, text, type });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3200);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Wait for a pause in typing before hitting the API
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

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
        setLoadError('');
        if (selectedBrand === 'All' && !searchQuery) {
          setFeatured((f) => f ?? data.data.find((p: ProductType) => p.isNewArrival) ?? data.data[0] ?? null);
        }
      } else {
        setLoadError(data.error || 'The catalogue could not be loaded.');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setLoadError('The catalogue could not be loaded. Check the connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, searchQuery, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product: ProductType) => {
    const inCart = cart.find((item) => item.product._id === product._id)?.quantity ?? 0;
    if (product.stock !== undefined && inCart >= product.stock) {
      showToast(`Only ${product.stock} of ${product.name} in stock`, 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`${product.name} added to bag`);
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
        .filter(Boolean) as CartLine[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== id));
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const checkout = async (details: { name: string; email: string; address: string }) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // only IDs and quantities are sent: the server looks up prices and checks stock
      body: JSON.stringify({
        items: cart.map((item) => ({ productId: item.product._id, quantity: item.quantity })),
        ...details,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.success) throw new Error(data.error || 'Could not place the order. Try again.');
    setCart([]);
    fetchProducts(); // refresh stock counts
    return data.orderNumber as string;
  };

  const resetFilters = () => {
    setSelectedBrand('All');
    setSearchInput('');
  };

  return (
    <MotionConfig reducedMotion="user">
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <button className="logo" onClick={() => { resetFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="PhoneVault home">
            <span className="logo-mark" aria-hidden />
            PhoneVault
          </button>

          <div className="nav-links">
            <a className="nav-link" href="#shop">Shop</a>
            <button className="nav-link staff" onClick={() => setIsOrdersModalOpen(true)}>Orders</button>
            <button className="nav-link staff" onClick={() => setIsAddModalOpen(true)}>Add phone</button>
            <button className="cart-btn" onClick={() => setIsCartOpen(true)} aria-label={`Open bag, ${cartItemCount} items`}>
              Bag
              <motion.span key={cartItemCount} className="cart-count" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                {cartItemCount}
              </motion.span>
            </button>
          </div>
        </div>
      </nav>

      <header className="hero" ref={heroRef}>
        <div className="wrap hero-inner">
          <div>
            <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {featured ? `New · ${featured.name}` : 'The phone store'}
            </motion.p>
            <h1>
              {['Flagships,', 'minus the', 'guesswork.'].map((line, i) => (
                <span className="line" key={line}>
                  <motion.span className={i === 1 ? 'dim' : ''} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.1 }}>
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p className="hero-sub" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}>
              Compare the specs that matter, see real stock, and check out in under a minute.
            </motion.p>
            <motion.div className="hero-cta" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}>
              <a className="btn btn-blue" href="#shop">Shop phones</a>
              {featured && (
                <button className="link" onClick={() => setSelectedProduct(featured)}>
                  See the {featured.name.replace(`${featured.brand} `, '')} ›
                </button>
              )}
            </motion.div>
          </div>

          <motion.div className="hero-visual" style={{ y: heroY, rotate: heroRotate }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}>
            {featured ? (
              <>
                <img src={featured.image} alt={featured.name} />
                <motion.div className="hero-card" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.9 }}>
                  <small>{featured.brand}</small>
                  <strong>From {usd(featured.price)}</strong>
                </motion.div>
              </>
            ) : (
              <div className="skeleton" style={{ height: '100%', borderRadius: 40 }} />
            )}
          </motion.div>
        </div>
      </header>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[0, 1].map((copy) =>
            BRANDS.slice(1).concat(BRANDS.slice(1)).map((b, i) => <span key={`${copy}-${i}`}>{b}</span>)
          )}
        </div>
      </div>

      <main className="wrap shop" id="shop">
        <div className="shop-head">
          <h2>
            {selectedBrand === 'All' ? 'All phones.' : `${selectedBrand}.`} <span>Take your pick.</span>
          </h2>
          <div className="tools">
            <label className="search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder="Search phones"
                aria-label="Search phones"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
            <select className="select" aria-label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>

        <div className="brands" role="tablist" aria-label="Brand">
          {BRANDS.map((b) => (
            <button key={b} role="tab" aria-selected={selectedBrand === b} className={`brand-pill ${selectedBrand === b ? 'active' : ''}`} onClick={() => setSelectedBrand(b)}>
              {selectedBrand === b && <motion.span layoutId="brand-pill" className="pill-bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="pill-label">{b}</span>
            </button>
          ))}
        </div>

        {loadError ? (
          <div className="empty">
            <h3>Something went wrong</h3>
            <p>{loadError}</p>
            <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={fetchProducts}>Try again</button>
          </div>
        ) : loading && products.length === 0 ? (
          <div className="grid">
            {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty">
            <h3>No phones match that</h3>
            <p>Try a different brand or search term.</p>
            <button className="btn btn-line" style={{ marginTop: 16 }} onClick={resetFilters}>Clear filters</button>
          </div>
        ) : (
          <LayoutGroup>
            <motion.div className="grid" animate={{ opacity: loading ? 0.5 : 1 }}>
              <AnimatePresence mode="popLayout">
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} onAddToCart={addToCart} onViewDetails={setSelectedProduct} />
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}
      </main>

      <section className="wrap promises">
        {PROMISES.map((p, i) => (
          <motion.div
            key={p.title}
            className="promise"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
          >
            <h4>{p.title}</h4>
            <p>{p.text}</p>
          </motion.div>
        ))}
      </section>

      <footer className="footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} PhoneVault · Demo store</span>
          <span>Next.js · MongoDB</span>
        </div>
      </footer>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />

      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={checkout}
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={(newProd) => {
          showToast(`${newProd.name} added to the catalogue`);
          fetchProducts();
        }}
      />

      <OrdersModal isOpen={isOrdersModalOpen} onClose={() => setIsOrdersModalOpen(false)} />

      <div className="toasts" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              className={`toast ${toast.type}`}
              initial={{ y: 40, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
