import { beforeEach, describe, expect, it } from 'vitest';
import * as demo from '@/lib/demoStore';
import { ValidationError } from '@/lib/validation';

const order = (productId: string, quantity: number) => ({
  customerName: 'Mohan', customerEmail: 'm@example.com', address: '12 Anna Salai, Chennai 600002',
  items: [{ productId, quantity }],
});

beforeEach(() => {
  delete (globalThis as { __phoneVaultDemo?: unknown }).__phoneVaultDemo;   // fresh catalogue per test
});

describe('demo mode', () => {
  it('is on only when no database is configured', () => {
    const saved = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;
    expect(demo.isDemoMode()).toBe(true);
    process.env.MONGODB_URI = 'mongodb://example/db';
    expect(demo.isDemoMode()).toBe(false);
    if (saved === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = saved;
  });
});

describe('demo catalogue', () => {
  it('lists, filters and sorts like the database does', () => {
    const all = demo.listProducts({ brand: null, search: null, sort: 'price-asc' });
    expect(all.length).toBeGreaterThan(0);
    expect(all.map((p) => p.price)).toEqual([...all.map((p) => p.price)].sort((a, b) => a - b));
    expect(demo.listProducts({ brand: 'apple', search: null, sort: null }).every((p) => p.brand === 'Apple')).toBe(true);
    expect(demo.listProducts({ brand: null, search: 'zzzz-no-such-phone', sort: null })).toEqual([]);
  });
});

describe('demo checkout', () => {
  it('prices from the catalogue and takes stock', () => {
    const phone = demo.listProducts({ brand: null, search: null, sort: null })[0];
    const before = phone.stock;
    const result = demo.placeOrder(order(phone._id, 2));
    expect(result.total).toBe(phone.price * 2);
    expect(result.orderNumber).toMatch(/^PV-[0-9A-F]{8}$/);
    expect(demo.getProduct(phone._id)!.stock).toBe(before - 2);
    expect(demo.listOrders()).toHaveLength(1);
  });

  it('refuses more than is in stock and changes nothing', () => {
    const phone = demo.listProducts({ brand: null, search: null, sort: null })[0];
    demo.updateProduct(phone._id, { stock: 1 });
    expect(() => demo.placeOrder(order(phone._id, 2))).toThrow(ValidationError);
    expect(demo.getProduct(phone._id)!.stock).toBe(1);
    expect(demo.listOrders()).toHaveLength(0);
  });

  it('refuses an unknown product', () => {
    expect(() => demo.placeOrder(order('f'.repeat(24), 1))).toThrow(ValidationError);
  });
});
