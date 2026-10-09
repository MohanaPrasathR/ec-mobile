/**
 * In-memory demo store, used only when MONGODB_URI is not set.
 *
 * It lets the shop run with no database (for example a preview deployment): the sample
 * catalogue is loaded on start and orders live in memory, so they reset whenever the server
 * restarts. When MONGODB_URI is set this module is never used, and database errors surface
 * as errors instead of quietly falling back to it.
 */
import { randomBytes } from 'crypto';
import initialProducts from '@/data/initial-products.json';
import { CatalogProduct, CheckoutInput, priceOrder, ValidationError } from '@/lib/validation';

export const isDemoMode = () => !process.env.MONGODB_URI;

type DemoProduct = Record<string, unknown> & {
  _id: string; name: string; brand: string; price: number; stock: number; image: string;
  description?: string; rating?: number; createdAt: string;
};
type DemoOrder = Record<string, unknown> & { _id: string; createdAt: string };

// Ids are derived from the catalogue position so every server instance agrees on them.
const objectId = (n: number) => n.toString(16).padStart(24, '0');

const globalStore = globalThis as { __phoneVaultDemo?: { products: DemoProduct[]; orders: DemoOrder[]; nextId: number } };

function state() {
  if (!globalStore.__phoneVaultDemo) {
    const now = Date.now();
    globalStore.__phoneVaultDemo = {
      products: initialProducts.map((p, i) => ({
        ...p, _id: objectId(i + 1), createdAt: new Date(now - i * 60_000).toISOString(),
      })) as DemoProduct[],
      orders: [],
      nextId: initialProducts.length + 1,
    };
  }
  return globalStore.__phoneVaultDemo;
}

const SORTS: Record<string, (a: DemoProduct, b: DemoProduct) => number> = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

/** `brand` and `search` arrive already regex-escaped by `searchTerm`. */
export function listProducts(opts: { brand: string | null; search: string | null; sort: string | null }) {
  let items = [...state().products];
  if (opts.brand && opts.brand !== 'All') {
    const brand = new RegExp(`^${opts.brand}$`, 'i');
    items = items.filter((p) => brand.test(p.brand));
  }
  if (opts.search) {
    const re = new RegExp(opts.search, 'i');
    items = items.filter((p) => re.test(p.name) || re.test(p.brand) || re.test(p.description ?? ''));
  }
  return items.sort(SORTS[opts.sort ?? ''] ?? SORTS.newest).slice(0, 100);
}

export const getProduct = (id: string) => state().products.find((p) => p._id === id) ?? null;

export function createProduct(data: Record<string, unknown>) {
  const s = state();
  const product = { category: 'Smartphones', stock: 20, ...data, _id: objectId(s.nextId++),
    createdAt: new Date().toISOString() } as unknown as DemoProduct;
  s.products.push(product);
  return product;
}

export function updateProduct(id: string, patch: Record<string, unknown>) {
  const product = getProduct(id);
  if (product) Object.assign(product, patch);
  return product;
}

export function deleteProduct(id: string) {
  const s = state();
  const before = s.products.length;
  s.products = s.products.filter((p) => p._id !== id);
  return s.products.length < before;
}

/** Prices the order from the catalogue and takes the stock, or throws a ValidationError. */
export function placeOrder(input: CheckoutInput) {
  const s = state();
  const catalog = new Map<string, CatalogProduct>(s.products.map((p) => [p._id,
    { _id: p._id, name: p.name, price: p.price, stock: p.stock, image: p.image }]));
  const { lines, total } = priceOrder(input.items, catalog);   // throws if anything is short
  for (const line of lines) {
    const product = getProduct(line.productId);
    if (!product || product.stock < line.quantity) throw new ValidationError(`${line.name} just sold out. Please update your cart.`);
  }
  for (const line of lines) getProduct(line.productId)!.stock -= line.quantity;

  const order: DemoOrder = {
    _id: randomBytes(12).toString('hex'),
    orderNumber: 'PV-' + randomBytes(4).toString('hex').toUpperCase(),
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    shippingAddress: { address: input.address },
    items: lines,
    total,
    paymentMethod: 'Cash on delivery (demo)',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  s.orders.unshift(order);
  return { orderNumber: order.orderNumber as string, total };
}

export const listOrders = () => state().orders.slice(0, 200);
