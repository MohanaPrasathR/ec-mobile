'use client';

import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export type ProductType = {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  category?: string;
  specs?: {
    ram?: string;
    storage?: string;
    battery?: string;
    camera?: string;
    display?: string;
    processor?: string;
    os?: string;
  };
  rating?: number;
  reviewCount?: number;
  stock?: number;
  isNewArrival?: boolean;
};

export const usd = (n: number) => '$' + n.toLocaleString('en-US');
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface ProductCardProps {
  product: ProductType;
  index: number;
  onAddToCart: (product: ProductType) => void;
  onViewDetails: (product: ProductType) => void;
}

export default function ProductCard({ product, index, onAddToCart, onViewDetails }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  // Card leans a few degrees towards the pointer
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 20 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 20 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  const soldOut = product.stock !== undefined && product.stock <= 0;
  const saving = product.originalPrice && product.originalPrice > product.price ? product.originalPrice - product.price : 0;
  const specLine = [product.specs?.storage, product.specs?.ram, product.specs?.battery].filter(Boolean).join(' · ');

  const add = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index, 8) * 0.05 }}
      style={{ perspective: 1000 }}
    >
      <motion.div className="card" style={{ rotateX, rotateY }} onPointerMove={onMove} onPointerLeave={onLeave}>
        <button className="card-media" onClick={() => onViewDetails(product)} aria-label={`View ${product.name}`}>
          <motion.img layoutId={`img-${product._id}`} src={product.image} alt={product.name} loading="lazy" />
          <span className="badges">
            {product.isNewArrival && <span className="badge new">New</span>}
            {saving > 0 && <span className="badge sale">Save {usd(saving)}</span>}
          </span>
        </button>

        <div className="card-body">
          <div className="card-brand">
            <span>{product.brand}</span>
            {product.rating ? <span>★ {product.rating.toFixed(1)}</span> : null}
          </div>
          <button className="card-name" onClick={() => onViewDetails(product)}>{product.name}</button>
          {specLine && <p className="card-specs">{specLine}</p>}

          <div className="card-foot">
            <div>
              <div className="price">
                {usd(product.price)}
                {saving > 0 && <s>{usd(product.originalPrice!)}</s>}
              </div>
              {soldOut ? (
                <span className="stock-note out">Sold out</span>
              ) : product.stock !== undefined && product.stock <= 5 ? (
                <span className="stock-note">Only {product.stock} left</span>
              ) : null}
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              className={`btn ${added ? 'btn-added' : 'btn-blue'}`}
              onClick={add}
              disabled={soldOut}
            >
              {added ? '✓ Added' : 'Add to bag'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
