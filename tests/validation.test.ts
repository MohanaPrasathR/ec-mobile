import { describe, expect, it } from 'vitest';
import { escapeRegex, parseCheckout, priceOrder, productPatch, searchTerm, ValidationError } from '@/lib/validation';

const id = (n: number) => n.toString(16).padStart(24, '0');
const valid = { name: 'Mohan', email: 'M@Example.com', address: '12 Anna Salai, Chennai 600002',
  items: [{ productId: id(1), quantity: 2 }] };

describe('search', () => {
  it('escapes regex metacharacters', () => {
    expect(escapeRegex('a.*(b)')).toBe('a\\.\\*\\(b\\)');
    expect(new RegExp(escapeRegex('(((a+)+)+)$')).test('(((a+)+)+)$')).toBe(true);
  });
  it('trims and caps search length', () => {
    expect(searchTerm('   ')).toBeNull();
    expect(searchTerm('x'.repeat(500))!.length).toBe(60);
  });
});

describe('checkout validation', () => {
  it('normalises a good request and merges duplicate lines', () => {
    const r = parseCheckout({ ...valid, items: [{ productId: id(1), quantity: 1 }, { productId: id(1), quantity: 2 }] });
    expect(r.customerEmail).toBe('m@example.com');
    expect(r.items).toEqual([{ productId: id(1), quantity: 3 }]);
  });
  it.each([
    [{ ...valid, items: [] }, 'empty'],
    [{ ...valid, items: [{ productId: id(1), quantity: -1 }] }, 'whole numbers'],
    [{ ...valid, items: [{ productId: id(1), quantity: 1.5 }] }, 'whole numbers'],
    [{ ...valid, items: [{ productId: 'abc', quantity: 1 }] }, 'invalid product'],
    [{ ...valid, items: [{ productId: id(1), quantity: 6 }] }, 'at most'],
    [{ ...valid, email: 'nope' }, 'email'],
    [{ ...valid, address: 'x' }, 'address'],
  ])('rejects bad input %#', (body, msg) => {
    expect(() => parseCheckout(body)).toThrow(msg);
  });
});

describe('pricing', () => {
  const catalog = new Map([[id(1), { _id: id(1), name: 'Pixel', price: 799.5, stock: 3, image: '/p.png' }]]);
  it('uses catalogue prices, never client prices', () => {
    const { total, lines } = priceOrder([{ productId: id(1), quantity: 2 }], catalog);
    expect(total).toBe(1599);
    expect(lines[0].price).toBe(799.5);
  });
  it('rejects unknown products and insufficient stock', () => {
    expect(() => priceOrder([{ productId: id(2), quantity: 1 }], catalog)).toThrow(ValidationError);
    expect(() => priceOrder([{ productId: id(1), quantity: 4 }], catalog)).toThrow('Only 3 left');
  });
});

describe('product patch', () => {
  it('drops fields that are not on the whitelist', () => {
    const p = productPatch({ price: '10', _id: 'hack', rating: 5, $where: 'x' }, false);
    expect(p).toEqual({ price: 10 });
  });
  it('requires core fields when creating and validates numbers and image URLs', () => {
    expect(() => productPatch({ name: 'X' }, true)).toThrow('required');
    expect(() => productPatch({ price: -5 }, false)).toThrow('non-negative');
    expect(() => productPatch({ image: 'javascript:alert(1)' }, false)).toThrow('Image');
  });
});
