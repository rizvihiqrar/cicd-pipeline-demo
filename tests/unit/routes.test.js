'use strict';

const express     = require('express');
const request     = require('supertest');
const createProductRouter = require('../../src/routes/products');

// Mirror the Pluralsight course's mock-service pattern:
// each test isolates the route handler by injecting a mock service,
// exactly as the course's Moq-based C# tests injected IInventoryService.

function mockService(overrides = {}) {
  return {
    getAll:  jest.fn(() => []),
    getById: jest.fn(() => null),
    create:  jest.fn(() => { throw new Error('not set up'); }),
    update:  jest.fn(() => null),
    remove:  jest.fn(() => false),
    ...overrides,
  };
}

function buildApp(service) {
  const app = express();
  app.use(express.json());
  app.use('/api/products', createProductRouter(service));
  return app;
}

// ─── GET / ────────────────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  test('returns 200 with empty array when no products', async () => {
    const app = buildApp(mockService({ getAll: jest.fn(() => []) }));
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 200 with products from service', async () => {
    const products = [{ id: 1, name: 'Widget', price: 9.99, stock: 5 }];
    const app = buildApp(mockService({ getAll: jest.fn(() => products) }));
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Widget');
  });
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────

describe('GET /api/products/:id — with valid id', () => {
  test('returns 200 with product when found', async () => {
    const product = { id: 1, name: 'Widget', price: 9.99, stock: 5 };
    const app = buildApp(mockService({ getById: jest.fn(() => product) }));
    const res = await request(app).get('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Widget');
  });
});

describe('GET /api/products/:id — with invalid id', () => {
  test('returns 404 when product not found', async () => {
    const app = buildApp(mockService({ getById: jest.fn(() => null) }));
    const res = await request(app).get('/api/products/999');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test('returns 400 for non-integer id', async () => {
    const app = buildApp(mockService());
    const res = await request(app).get('/api/products/abc');
    expect(res.status).toBe(400);
  });
});

// ─── POST / ───────────────────────────────────────────────────────────────────

describe('POST /api/products', () => {
  test('returns 201 with created product on success', async () => {
    const created = { id: 1, name: 'Widget', category: 'Tools', price: 9.99, stock: 50 };
    const app = buildApp(mockService({ create: jest.fn(() => created) }));
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Widget', category: 'Tools', price: 9.99, stock: 50 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
  });

  test('returns 400 when service throws validation error', async () => {
    const app = buildApp(mockService({ create: jest.fn(() => { throw new Error('name is required'); }) }));
    const res = await request(app).post('/api/products').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name is required/i);
  });
});

// ─── PUT /:id ─────────────────────────────────────────────────────────────────

describe('PUT /api/products/:id', () => {
  test('returns 200 with updated product', async () => {
    const updated = { id: 1, name: 'Updated', price: 15.00, stock: 20 };
    const app = buildApp(mockService({ update: jest.fn(() => updated) }));
    const res = await request(app).put('/api/products/1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  test('returns 404 when product not found', async () => {
    const app = buildApp(mockService({ update: jest.fn(() => null) }));
    const res = await request(app).put('/api/products/999').send({ name: 'X' });
    expect(res.status).toBe(404);
  });

  test('returns 400 for non-integer id', async () => {
    const app = buildApp(mockService());
    const res = await request(app).put('/api/products/abc').send({ name: 'X' });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

describe('DELETE /api/products/:id', () => {
  test('returns 204 when product deleted', async () => {
    const app = buildApp(mockService({ remove: jest.fn(() => true) }));
    const res = await request(app).delete('/api/products/1');
    expect(res.status).toBe(204);
  });

  test('returns 404 when product not found', async () => {
    const app = buildApp(mockService({ remove: jest.fn(() => false) }));
    const res = await request(app).delete('/api/products/999');
    expect(res.status).toBe(404);
  });

  test('returns 400 for non-integer id', async () => {
    const app = buildApp(mockService());
    const res = await request(app).delete('/api/products/abc');
    expect(res.status).toBe(400);
  });
});
