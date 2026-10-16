import { test, expect } from '@playwright/test';

// Integration tests run against a live server started by playwright.config.js webServer.
// They test the full stack: route handler → service → in-memory store.

const BASE = '/api/products';

test.describe('Product API — integration', () => {

  // ─── Health check ──────────────────────────────────────────────────────────

  test('GET /health returns 200 @smoke', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });

  // ─── Full CRUD flow ────────────────────────────────────────────────────────

  test('POST creates a product and returns 201 @smoke', async ({ request }) => {
    const res = await request.post(BASE, {
      data: { name: 'Integration Widget', category: 'Tools', price: 49.99, stock: 100 },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeGreaterThan(0);
    expect(body.name).toBe('Integration Widget');
    expect(body.category).toBe('Tools');
    expect(body.price).toBe(49.99);
    expect(body.stock).toBe(100);
  });

  test('GET /api/products/:id returns created product @smoke', async ({ request }) => {
    const created = await (await request.post(BASE, {
      data: { name: 'Lookup Test', price: 9.99, stock: 5 },
    })).json();

    const res = await request.get(`${BASE}/${created.id}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(created.id);
    expect(body.name).toBe('Lookup Test');
  });

  test('GET /api/products lists all products @regression', async ({ request }) => {
    await request.post(BASE, { data: { name: 'List Item A', price: 1, stock: 1 } });
    await request.post(BASE, { data: { name: 'List Item B', price: 2, stock: 2 } });

    const res = await request.get(BASE);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(2);
  });

  test('PUT updates product fields @regression', async ({ request }) => {
    const created = await (await request.post(BASE, {
      data: { name: 'Before Update', price: 10, stock: 1 },
    })).json();

    const res = await request.put(`${BASE}/${created.id}`, {
      data: { name: 'After Update', price: 99, stock: 50 },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('After Update');
    expect(body.price).toBe(99);
    expect(body.stock).toBe(50);
  });

  test('DELETE removes the product and subsequent GET returns 404 @regression', async ({ request }) => {
    const created = await (await request.post(BASE, {
      data: { name: 'To Delete', price: 5, stock: 1 },
    })).json();

    const del = await request.delete(`${BASE}/${created.id}`);
    expect(del.status()).toBe(204);

    const get = await request.get(`${BASE}/${created.id}`);
    expect(get.status()).toBe(404);
  });

  // ─── Validation errors ─────────────────────────────────────────────────────

  test('POST with missing name returns 400 @regression', async ({ request }) => {
    const res = await request.post(BASE, { data: { price: 5, stock: 1 } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/name/i);
  });

  test('POST with negative price returns 400 @regression', async ({ request }) => {
    const res = await request.post(BASE, { data: { name: 'X', price: -1, stock: 1 } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/price/i);
  });

  test('POST with fractional stock returns 400 @regression', async ({ request }) => {
    const res = await request.post(BASE, { data: { name: 'X', price: 1, stock: 1.5 } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/stock/i);
  });

  // ─── 404 cases ─────────────────────────────────────────────────────────────

  test('GET unknown id returns 404 @regression', async ({ request }) => {
    const res = await request.get(`${BASE}/999999`);
    expect(res.status()).toBe(404);
  });

  test('PUT unknown id returns 404 @regression', async ({ request }) => {
    const res = await request.put(`${BASE}/999999`, { data: { name: 'X' } });
    expect(res.status()).toBe(404);
  });

  test('DELETE unknown id returns 404 @regression', async ({ request }) => {
    const res = await request.delete(`${BASE}/999999`);
    expect(res.status()).toBe(404);
  });

  // ─── Response headers ──────────────────────────────────────────────────────

  test('responses include content-type: application/json @regression', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.headers()['content-type']).toMatch(/application\/json/);
  });

  test('X-Powered-By header is not exposed @regression', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.headers()['x-powered-by']).toBeUndefined();
  });
});
