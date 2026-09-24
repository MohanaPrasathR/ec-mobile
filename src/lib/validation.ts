/** Input validation shared by the API routes. Pure functions, unit-tested in tests/. */

export class ValidationError extends Error {
  status = 400;
}

export const MAX_QTY_PER_ITEM = 5;
export const MAX_ITEMS_PER_ORDER = 20;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/** Escape user text before putting it in a MongoDB $regex (prevents regex injection / ReDoS). */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function searchTerm(raw: string | null, max = 60): string | null {
  const t = (raw ?? '').trim().slice(0, max);
  return t ? escapeRegex(t) : null;
}

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  address: string;
  items: { productId: string; quantity: number }[];
}

export function parseCheckout(body: unknown): CheckoutInput {
  if (!body || typeof body !== 'object') throw new ValidationError('Invalid request body.');
  const b = body as Record<string, unknown>;
  const customerName = typeof b.name === 'string' ? b.name.trim() : '';
  const customerEmail = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const address = typeof b.address === 'string' ? b.address.trim() : '';
  if (customerName.length < 2 || customerName.length > 100) throw new ValidationError('Enter your full name.');
  if (!EMAIL_RE.test(customerEmail)) throw new ValidationError('Enter a valid email address.');
  if (address.length < 10 || address.length > 300) throw new ValidationError('Enter a complete shipping address.');
  if (!Array.isArray(b.items) || b.items.length === 0) throw new ValidationError('Your cart is empty.');
  if (b.items.length > MAX_ITEMS_PER_ORDER) throw new ValidationError('Too many different items in one order.');

  const merged = new Map<string, number>();
  for (const raw of b.items) {
    const it = raw as Record<string, unknown>;
    const productId = String(it?.productId ?? '');
    const quantity = Number(it?.quantity);
    if (!OBJECT_ID_RE.test(productId)) throw new ValidationError('Your cart contains an invalid product.');
    if (!Number.isInteger(quantity) || quantity < 1) throw new ValidationError('Quantities must be whole numbers of at least 1.');
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }
  for (const q of merged.values()) {
    if (q > MAX_QTY_PER_ITEM) throw new ValidationError(`You can buy at most ${MAX_QTY_PER_ITEM} of each phone.`);
  }
  return { customerName, customerEmail, address, items: [...merged].map(([productId, quantity]) => ({ productId, quantity })) };
}

export interface CatalogProduct { _id: string; name: string; price: number; stock: number; image: string }

/** Prices an order from the catalogue only; client-sent prices are never used. */
export function priceOrder(items: CheckoutInput['items'], catalog: Map<string, CatalogProduct>) {
  const lines = items.map(({ productId, quantity }) => {
    const p = catalog.get(productId);
    if (!p) throw new ValidationError('A product in your cart is no longer available.');
    if (p.stock < quantity) throw new ValidationError(`Only ${p.stock} left of ${p.name}.`);
    return { productId, name: p.name, price: p.price, quantity, image: p.image };
  });
  const total = Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;
  return { lines, total };
}

const PRODUCT_FIELDS = ['name', 'brand', 'price', 'originalPrice', 'category', 'image', 'images', 'description',
  'stock', 'isFeatured', 'isNewArrival', 'specs', 'tags'] as const;

/** Whitelists product fields so an update can't set arbitrary properties (mass assignment). */
export function productPatch(body: unknown, requireCore: boolean): Record<string, unknown> {
  if (!body || typeof body !== 'object') throw new ValidationError('Invalid request body.');
  const b = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of PRODUCT_FIELDS) if (b[k] !== undefined) out[k] = b[k];
  if (requireCore && (!out.name || !out.brand || out.price === undefined || !out.image)) {
    throw new ValidationError('Name, brand, price and image URL are required.');
  }
  for (const k of ['price', 'originalPrice', 'stock'] as const) {
    if (out[k] !== undefined) {
      const n = Number(out[k]);
      if (!Number.isFinite(n) || n < 0) throw new ValidationError(`${k} must be a non-negative number.`);
      out[k] = k === 'stock' ? Math.floor(n) : n;
    }
  }
  if (typeof out.image === 'string' && !/^https?:\/\//.test(out.image) && !out.image.startsWith('/')) {
    throw new ValidationError('Image must be an http(s) URL or a site path.');
  }
  return out;
}
