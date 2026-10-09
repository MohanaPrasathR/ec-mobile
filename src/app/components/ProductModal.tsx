'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { EASE, ProductType, usd } from './ProductCard';

interface ProductModalProps {
  product: ProductType | null;
  onClose: () => void;
  onAddToCart: (product: ProductType) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const specs = product
    ? [
        { label: 'Storage', value: product.specs?.storage },
        { label: 'Memory', value: product.specs?.ram },
        { label: 'Camera', value: product.specs?.camera },
        { label: 'Battery', value: product.specs?.battery },
        { label: 'Processor', value: product.specs?.processor },
        { label: 'Software', value: product.specs?.os },
        { label: 'Display', value: product.specs?.display, full: true },
      ].filter((s) => s.value)
    : [];
  const soldOut = !!product && product.stock !== undefined && product.stock <= 0;

  return (
    <AnimatePresence>
      {product && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="sheet wide"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <button className="icon-btn close" onClick={onClose} aria-label="Close">✕</button>

            <div className="detail-media">
              <motion.img layoutId={`img-${product._id}`} src={product.image} alt={product.name} transition={{ duration: 0.55, ease: EASE }} />
            </div>

            <motion.div
              className="detail-body"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                <div className="card-brand" style={{ marginBottom: 8 }}>
                  <span>{product.brand}</span>
                  {product.rating ? <span>★ {product.rating.toFixed(1)}{product.reviewCount ? ` · ${product.reviewCount} reviews` : ''}</span> : null}
                </div>
                <h2>{product.name}</h2>
              </motion.div>

              {product.description && (
                <motion.p className="desc" variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                  {product.description}
                </motion.p>
              )}

              {specs.length > 0 && (
                <motion.div className="specs" variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                  {specs.map((s) => (
                    <div key={s.label} className={`spec ${s.full ? 'full' : ''}`}>
                      <small>{s.label}</small>
                      <span>{s.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="price" style={{ fontSize: 28 }}>
                  {usd(product.price)}
                  {product.originalPrice && product.originalPrice > product.price && <s>{usd(product.originalPrice)}</s>}
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="btn btn-blue btn-block"
                  disabled={soldOut}
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                >
                  {soldOut ? 'Sold out' : 'Add to bag'}
                </motion.button>
                {!soldOut && product.stock !== undefined && (
                  <span className="fine">{product.stock <= 5 ? `Only ${product.stock} left in stock.` : 'In stock.'} Cash on delivery.</span>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
