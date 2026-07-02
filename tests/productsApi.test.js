// Unit tests for the in-memory product store used by the /products API.
const productsApi = require('../src/productsApi');

beforeEach(() => {
  productsApi.resetProducts();
});

test('getAllProducts returns the seeded catalog', () => {
  const products = productsApi.getAllProducts();
  expect(products).toHaveLength(8);
  expect(products[0]).toEqual({ id: 101, name: 'T-Shirt Basic', price: 4.5 });
});

test('createProduct adds a new product with an incremented id', () => {
  const created = productsApi.createProduct({ name: 'Beanie', price: 9.99 });
  expect(created).toEqual({ id: 109, name: 'Beanie', price: 9.99 });
  expect(productsApi.getAllProducts()).toHaveLength(9);
  expect(productsApi.getAllProducts()).toContainEqual(created);
});

test.each([
  [{ price: 5 }, 'invalid name'],
  [{ name: '', price: 5 }, 'invalid name'],
  [{ name: '   ', price: 5 }, 'invalid name'],
  [{ name: 123, price: 5 }, 'invalid name'],
  [{ name: 'Cap' }, 'invalid price'],
  [{ name: 'Cap', price: 0 }, 'invalid price'],
  [{ name: 'Cap', price: -1 }, 'invalid price'],
  [{ name: 'Cap', price: 'five' }, 'invalid price'],
  [{ name: 'Cap', price: NaN }, 'invalid price'],
])('createProduct rejects invalid input %p', (input, message) => {
  expect(() => productsApi.createProduct(input)).toThrow(message);
});
