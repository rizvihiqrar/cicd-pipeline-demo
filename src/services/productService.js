'use strict';

let _store = new Map();
let _nextId = 1;

function reset() {
  _store = new Map();
  _nextId = 1;
}

function getAll() {
  return Array.from(_store.values());
}

function getById(id) {
  return _store.get(id) ?? null;
}

function create({ name, category, price, stock }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new Error('name is required');
  }
  if (price == null || typeof price !== 'number' || price < 0) {
    throw new Error('price must be a non-negative number');
  }
  if (stock == null || !Number.isInteger(stock) || stock < 0) {
    throw new Error('stock must be a non-negative integer');
  }

  const product = {
    id:       _nextId++,
    name:     name.trim(),
    category: category ? String(category).trim() : 'Uncategorised',
    price,
    stock,
    createdAt: new Date().toISOString(),
  };
  _store.set(product.id, product);
  return product;
}

function update(id, fields) {
  const existing = _store.get(id);
  if (!existing) return null;

  if (fields.name !== undefined) {
    if (!fields.name || typeof fields.name !== 'string' || !fields.name.trim()) {
      throw new Error('name must be a non-empty string');
    }
  }
  if (fields.price !== undefined && (typeof fields.price !== 'number' || fields.price < 0)) {
    throw new Error('price must be a non-negative number');
  }
  if (fields.stock !== undefined && (!Number.isInteger(fields.stock) || fields.stock < 0)) {
    throw new Error('stock must be a non-negative integer');
  }

  const updated = {
    ...existing,
    ...(fields.name     !== undefined ? { name: fields.name.trim() }         : {}),
    ...(fields.category !== undefined ? { category: String(fields.category) } : {}),
    ...(fields.price    !== undefined ? { price: fields.price }               : {}),
    ...(fields.stock    !== undefined ? { stock: fields.stock }               : {}),
    updatedAt: new Date().toISOString(),
  };
  _store.set(id, updated);
  return updated;
}

function remove(id) {
  if (!_store.has(id)) return false;
  _store.delete(id);
  return true;
}

module.exports = { getAll, getById, create, update, remove, reset };
