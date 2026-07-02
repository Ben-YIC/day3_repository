// HTTP-level tests for the GET/POST /products endpoints.
const { createServer } = require('../server');
const productsApi = require('../src/productsApi');

let server;
let baseUrl;

beforeEach(async () => {
  productsApi.resetProducts();
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = 'http://localhost:' + server.address().port;
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /products returns the full catalog as an array', async () => {
  const res = await fetch(baseUrl + '/products');
  const body = await res.json();
  expect(res.status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(body).toHaveLength(8);
  expect(body).toContainEqual({ id: 101, name: 'T-Shirt Basic', price: 4.5 });
});

test('POST /products with a valid body creates and stores a product', async () => {
  const res = await fetch(baseUrl + '/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Beanie', price: 9.99 }),
  });
  const created = await res.json();
  expect(res.status).toBe(201);
  expect(created).toEqual({ id: 109, name: 'Beanie', price: 9.99 });

  const listRes = await fetch(baseUrl + '/products');
  const list = await listRes.json();
  expect(list).toContainEqual(created);
});

test.each([
  [{ price: 5 }],
  [{ name: '', price: 5 }],
  [{ name: 'Cap' }],
  [{ name: 'Cap', price: -1 }],
  [{ name: 'Cap', price: 'five' }],
])('POST /products with invalid body %p returns 400 with an error message', async (input) => {
  const res = await fetch(baseUrl + '/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await res.json();
  expect(res.status).toBe(400);
  expect(typeof body.error).toBe('string');
});

test('POST /products with malformed JSON returns 400', async () => {
  const res = await fetch(baseUrl + '/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{not valid json',
  });
  const body = await res.json();
  expect(res.status).toBe(400);
  expect(typeof body.error).toBe('string');
});

test('unknown routes return 404', async () => {
  const res = await fetch(baseUrl + '/unknown');
  expect(res.status).toBe(404);
});
