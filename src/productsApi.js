// In-memory product store for the /products HTTP API.
// Kept independent from src/db.js's order-domain product table (which
// carries cat/st fields used by order validation) so this API can't
// disturb existing order behavior or query-count semantics.

const seed = [
  { id: 101, name: 'T-Shirt Basic', price: 4.5 },
  { id: 102, name: 'Polo Shirt', price: 7.25 },
  { id: 103, name: 'Hoodie Fleece', price: 12.0 },
  { id: 104, name: 'Cargo Pants', price: 11.5 },
  { id: 105, name: 'Denim Jeans', price: 14.0 },
  { id: 106, name: 'Track Shorts', price: 5.75 },
  { id: 107, name: 'Windbreaker', price: 18.5 },
  { id: 108, name: 'Puffer Vest', price: 22.0 },
];

let products = seed.map((p) => ({ ...p }));

function getAllProducts() {
  return products;
}

function createProduct({ name, price }) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('invalid name');
  }
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    throw new Error('invalid price');
  }
  const nextId = products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const product = { id: nextId, name: name.trim(), price };
  products.push(product);
  return product;
}

function resetProducts() {
  products = seed.map((p) => ({ ...p }));
}

module.exports = { getAllProducts, createProduct, resetProducts };
