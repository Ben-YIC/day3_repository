// Unit tests for the new reporting module (src/reports.js), extracted from legacy.js.
let reports;

beforeEach(() => {
  jest.resetModules();
  reports = require('../src/reports');
});

describe('listOrdersByStatus', () => {
  test('lists OPEN orders with enriched customer/line info', () => {
    expect(reports.listOrdersByStatus('OPEN')).toEqual([
      { id: 1005, date: '2026-02-09', customer: 'Hue Trading', city: 'Hue', lines: 1, units: 500 },
      { id: 1007, date: '2026-02-21', customer: 'Can Tho Apparel', city: 'Can Tho', lines: 2, units: 320 },
      { id: 1009, date: '2026-03-08', customer: 'Hanoi Garment Co', city: 'Hanoi', lines: 1, units: 400 },
    ]);
  });

  test('lists DONE orders', () => {
    const done = reports.listOrdersByStatus('DONE');
    expect(done).toHaveLength(6);
    expect(done.map((o) => o.id)).toEqual([1001, 1002, 1004, 1006, 1008, 1010]);
  });

  test('returns empty array for a status with no matches', () => {
    expect(reports.listOrdersByStatus('NOPE')).toEqual([]);
  });
});

describe('topSellingProducts', () => {
  test('top 3 by units sold', () => {
    expect(reports.topSellingProducts(3)).toEqual([
      { name: 'T-Shirt Basic', units: 650 },
      { name: 'Polo Shirt', units: 270 },
      { name: 'Track Shorts', units: 130 },
    ]);
  });

  test('top 1 returns a single entry', () => {
    expect(reports.topSellingProducts(1)).toEqual([{ name: 'T-Shirt Basic', units: 650 }]);
  });
});

describe('generateMonthlyReport', () => {
  test('renders the full report for a month with orders', () => {
    expect(reports.generateMonthlyReport('2026-02')).toBe(
      '==========================================\n' +
      ' MONTHLY ORDER REPORT  2026-02\n' +
      '==========================================\n' +
      '\n' +
      'Order #1004  [DONE]  2026-02-02\n' +
      '  Customer: Danang Fabrics (Danang, tier A)\n' +
      '    Windbreaker  x60  @ $18.50  = $1,110.00\n' +
      '    T-Shirt Basic  x150  @ $4.50  = $675.00\n' +
      '  Subtotal: $1,785.00   Total(incl. disc+tax): $1,735.02\n' +
      '\n' +
      'Order #1005  [OPEN]  2026-02-09\n' +
      '  Customer: Hue Trading (Hue, tier C)\n' +
      '    Track Shorts  x500  @ $5.75  = $2,875.00\n' +
      '  Subtotal: $2,875.00   Total(incl. disc+tax): $3,011.85\n' +
      '\n' +
      'Order #1006  [DONE]  2026-02-15\n' +
      '  Customer: Saigon Textile (HCMC, tier B)\n' +
      '    Puffer Vest  x30  @ $22.00  = $660.00\n' +
      '    Polo Shirt  x90  @ $7.25  = $652.50\n' +
      '  Subtotal: $1,312.50   Total(incl. disc+tax): $1,346.63\n' +
      '\n' +
      'Order #1007  [OPEN]  2026-02-21\n' +
      '  Customer: Can Tho Apparel (Can Tho, tier B)\n' +
      '    Cargo Pants  x220  @ $11.50  = $2,530.00\n' +
      '    Denim Jeans  x100  @ $14.00  = $1,400.00\n' +
      '  Subtotal: $3,930.00   Total(incl. disc+tax): $4,032.18\n' +
      '\n' +
      '------------------------------------------\n' +
      ' Orders counted: 4\n' +
      ' Grand total:    $10,125.68\n' +
      '=========================================='
      + '\n'
    );
  });

  test('renders an empty report for a month with no orders', () => {
    expect(reports.generateMonthlyReport('2099-01')).toBe(
      '==========================================\n' +
      ' MONTHLY ORDER REPORT  2099-01\n' +
      '==========================================\n' +
      '\n' +
      '------------------------------------------\n' +
      ' Orders counted: 0\n' +
      ' Grand total:    $0.00\n' +
      '=========================================='
      + '\n'
    );
  });
});
