// Data access layer: raw records + lookup helpers.
// Field names are abbreviated to match the original data import
// (n = name, t = tier, d = discount, ct = city, pr = price, st = stock,
// cid = customer id, dt = date, s = status, oid/pid = order/product id, q = qty).

const customers = [
  { id: 1, n: 'Hanoi Garment Co', t: 'A', d: 0.1, ct: 'Hanoi' },
  { id: 2, n: 'Saigon Textile', t: 'B', d: 0.05, ct: 'HCMC' },
  { id: 3, n: 'Danang Fabrics', t: 'A', d: 0.1, ct: 'Danang' },
  { id: 4, n: 'Hue Trading', t: 'C', d: 0, ct: 'Hue' },
  { id: 5, n: 'Can Tho Apparel', t: 'B', d: 0.05, ct: 'Can Tho' },
];

const products = [
  { id: 101, n: 'T-Shirt Basic', pr: 4.5, cat: 'TOP', st: 1200 },
  { id: 102, n: 'Polo Shirt', pr: 7.25, cat: 'TOP', st: 800 },
  { id: 103, n: 'Hoodie Fleece', pr: 12.0, cat: 'TOP', st: 450 },
  { id: 104, n: 'Cargo Pants', pr: 11.5, cat: 'BOT', st: 600 },
  { id: 105, n: 'Denim Jeans', pr: 14.0, cat: 'BOT', st: 350 },
  { id: 106, n: 'Track Shorts', pr: 5.75, cat: 'BOT', st: 900 },
  { id: 107, n: 'Windbreaker', pr: 18.5, cat: 'OUT', st: 200 },
  { id: 108, n: 'Puffer Vest', pr: 22.0, cat: 'OUT', st: 150 },
];

const orders = [
  { id: 1001, cid: 1, dt: '2026-01-05', s: 'DONE' },
  { id: 1002, cid: 2, dt: '2026-01-12', s: 'DONE' },
  { id: 1003, cid: 1, dt: '2026-01-20', s: 'CANCEL' },
  { id: 1004, cid: 3, dt: '2026-02-02', s: 'DONE' },
  { id: 1005, cid: 4, dt: '2026-02-09', s: 'OPEN' },
  { id: 1006, cid: 2, dt: '2026-02-15', s: 'DONE' },
  { id: 1007, cid: 5, dt: '2026-02-21', s: 'OPEN' },
  { id: 1008, cid: 3, dt: '2026-03-01', s: 'DONE' },
  { id: 1009, cid: 1, dt: '2026-03-08', s: 'OPEN' },
  { id: 1010, cid: 4, dt: '2026-03-15', s: 'DONE' },
];

const orderLines = [
  { oid: 1001, pid: 101, q: 200 },
  { oid: 1001, pid: 104, q: 50 },
  { oid: 1002, pid: 102, q: 120 },
  { oid: 1002, pid: 105, q: 80 },
  { oid: 1002, pid: 101, q: 300 },
  { oid: 1003, pid: 103, q: 40 },
  { oid: 1004, pid: 107, q: 60 },
  { oid: 1004, pid: 101, q: 150 },
  { oid: 1005, pid: 106, q: 500 },
  { oid: 1006, pid: 108, q: 30 },
  { oid: 1006, pid: 102, q: 90 },
  { oid: 1007, pid: 104, q: 220 },
  { oid: 1007, pid: 105, q: 100 },
  { oid: 1008, pid: 103, q: 75 },
  { oid: 1008, pid: 106, q: 130 },
  { oid: 1009, pid: 101, q: 400 },
  { oid: 1010, pid: 107, q: 45 },
  { oid: 1010, pid: 102, q: 60 },
];

const tables = { c: customers, p: products, o: orders, l: orderLines };

let queryCount = 0;

// gets one row from table t by id k
function getById(t, k) {
  queryCount++;
  const rows = tables[t];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].id === k) {
      return rows[i];
    }
  }
  return null;
}

// gets all rows for table t
function getAllRows(t) {
  queryCount++;
  return tables[t];
}

// order lines for order id
function getOrderLines(orderId) {
  queryCount++;
  const result = [];
  for (let i = 0; i < orderLines.length; i++) {
    if (orderLines[i].oid === orderId) {
      result.push(orderLines[i]);
    }
  }
  return result;
}

function getQueryCount() {
  return queryCount;
}

module.exports = { getById, getAllRows, getOrderLines, getQueryCount };
