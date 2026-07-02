// Unit tests for the new data-access module (src/db.js), extracted from legacy.js.
let db;

beforeEach(() => {
  jest.resetModules();
  db = require('../src/db');
});

test('getById returns a row by id and increments the query counter', () => {
  expect(db.getQueryCount()).toBe(0);
  expect(db.getById('c', 1)).toEqual({ id: 1, n: 'Hanoi Garment Co', t: 'A', d: 0.1, ct: 'Hanoi' });
  expect(db.getQueryCount()).toBe(1);
});

test('getById returns null for an unknown id', () => {
  expect(db.getById('c', 999)).toBeNull();
});

test('getAllRows returns the whole table', () => {
  expect(db.getAllRows('p')).toHaveLength(8);
});

test('getOrderLines returns lines for an order, empty array when none', () => {
  expect(db.getOrderLines(1002)).toEqual([
    { oid: 1002, pid: 102, q: 120 },
    { oid: 1002, pid: 105, q: 80 },
    { oid: 1002, pid: 101, q: 300 },
  ]);
  expect(db.getOrderLines(9999)).toEqual([]);
});

test('getQueryCount accumulates across calls and never resets', () => {
  db.getById('c', 1);
  db.getById('c', 2);
  db.getAllRows('p');
  expect(db.getQueryCount()).toBe(3);
});
