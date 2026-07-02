// HTTP-level tests for GET /products.
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

test('unknown routes return 404', async () => {
  const res = await fetch(baseUrl + '/unknown');
  expect(res.status).toBe(404);
});
