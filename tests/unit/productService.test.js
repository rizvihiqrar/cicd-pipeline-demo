'use strict';

const service = require('../../src/services/productService');

beforeEach(() => service.reset());

// ─── create ───────────────────────────────────────────────────────────────────

describe('productService.create', () => {
  test('returns product with auto-assigned id', () => {
    const p = service.create({ name: 'Widget', price: 9.99, stock: 50 });
    expect(p.id).toBe(1);
    expect(p.name).toBe('Widget');
  });

  test('assigns Uncategorised when category is omitted', () => {
    const p = service.create({ name: 'Gadget', price: 19.99, stock: 10 });
    expect(p.category).toBe('Uncategorised');
  });

  test('assigns provided category', () => {
    const p = service.create({ name: 'Gadget', category: 'Electronics', price: 19.99, stock: 10 });
    expect(p.category).toBe('Electronics');
  });

  test('ids increment across creates', () => {
    const a = service.create({ name: 'A', price: 1, stock: 1 });
    const b = service.create({ name: 'B', price: 2, stock: 2 });
    expect(b.id).toBe(a.id + 1);
  });

  test('throws when name is missing', () => {
    expect(() => service.create({ price: 5, stock: 1 })).toThrow('name is required');
  });

  test('throws when name is empty string', () => {
    expect(() => service.create({ name: '  ', price: 5, stock: 1 })).toThrow('name is required');
  });

  test('throws when price is negative', () => {
    expect(() => service.create({ name: 'X', price: -1, stock: 1 })).toThrow('price must be');
  });

  test('throws when price is missing', () => {
    expect(() => service.create({ name: 'X', stock: 1 })).toThrow('price must be');
  });

  test('throws when stock is fractional', () => {
    expect(() => service.create({ name: 'X', price: 1, stock: 1.5 })).toThrow('stock must be');
  });

  test('throws when stock is negative', () => {
    expect(() => service.create({ name: 'X', price: 1, stock: -1 })).toThrow('stock must be');
  });

  test('product has createdAt timestamp', () => {
    const p = service.create({ name: 'Y', price: 0, stock: 0 });
    expect(p.createdAt).toBeDefined();
    expect(() => new Date(p.createdAt)).not.toThrow();
  });
});

// ─── getAll / getById ─────────────────────────────────────────────────────────

describe('productService.getAll / getById', () => {
  test('getAll returns empty array when no products', () => {
    expect(service.getAll()).toEqual([]);
  });

  test('getAll returns all created products', () => {
    service.create({ name: 'A', price: 1, stock: 1 });
    service.create({ name: 'B', price: 2, stock: 2 });
    expect(service.getAll()).toHaveLength(2);
  });

  test('getById returns correct product', () => {
    const created = service.create({ name: 'Widget', price: 9.99, stock: 5 });
    const found   = service.getById(created.id);
    expect(found).toEqual(created);
  });

  test('getById returns null for unknown id', () => {
    expect(service.getById(9999)).toBeNull();
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('productService.update', () => {
  test('updates name field', () => {
    const p = service.create({ name: 'Old', price: 5, stock: 1 });
    const u = service.update(p.id, { name: 'New' });
    expect(u.name).toBe('New');
  });

  test('updates price field', () => {
    const p = service.create({ name: 'A', price: 5, stock: 1 });
    const u = service.update(p.id, { price: 99 });
    expect(u.price).toBe(99);
  });

  test('updates stock field', () => {
    const p = service.create({ name: 'A', price: 5, stock: 1 });
    const u = service.update(p.id, { stock: 100 });
    expect(u.stock).toBe(100);
  });

  test('preserves unchanged fields', () => {
    const p = service.create({ name: 'A', category: 'Cat', price: 5, stock: 1 });
    const u = service.update(p.id, { price: 10 });
    expect(u.name).toBe('A');
    expect(u.category).toBe('Cat');
  });

  test('returns null for unknown id', () => {
    expect(service.update(9999, { name: 'X' })).toBeNull();
  });

  test('throws on invalid name in update', () => {
    const p = service.create({ name: 'A', price: 1, stock: 1 });
    expect(() => service.update(p.id, { name: '' })).toThrow('name must be');
  });

  test('throws on negative price in update', () => {
    const p = service.create({ name: 'A', price: 1, stock: 1 });
    expect(() => service.update(p.id, { price: -5 })).toThrow('price must be');
  });

  test('sets updatedAt on update', () => {
    const p = service.create({ name: 'A', price: 1, stock: 1 });
    const u = service.update(p.id, { stock: 2 });
    expect(u.updatedAt).toBeDefined();
  });
});

// ─── remove ───────────────────────────────────────────────────────────────────

describe('productService.remove', () => {
  test('returns true and removes product', () => {
    const p = service.create({ name: 'A', price: 1, stock: 1 });
    expect(service.remove(p.id)).toBe(true);
    expect(service.getById(p.id)).toBeNull();
  });

  test('returns false for unknown id', () => {
    expect(service.remove(9999)).toBe(false);
  });

  test('getAll count decreases after remove', () => {
    const p = service.create({ name: 'A', price: 1, stock: 1 });
    service.create({ name: 'B', price: 2, stock: 2 });
    service.remove(p.id);
    expect(service.getAll()).toHaveLength(1);
  });
});
