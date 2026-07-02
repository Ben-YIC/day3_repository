// Characterization tests: pin down the CURRENT behavior of legacy.js.
// Module state (D, qc) is mutated in place by q/qa/ql/upd, so each test
// gets a fresh module instance via jest.resetModules().

let m;

beforeEach(() => {
  jest.resetModules();
  m = require('../legacy');
});

describe('q / qa / ql (data access + query counter)', () => {
  test('q returns a row by id and increments the counter', () => {
    expect(m.cnt()).toBe(0);
    expect(m.q('c', 1)).toEqual({ id: 1, n: 'Hanoi Garment Co', t: 'A', d: 0.1, ct: 'Hanoi' });
    expect(m.cnt()).toBe(1);
  });

  test('q returns null for an unknown id', () => {
    expect(m.q('c', 999)).toBeNull();
  });

  test('qa returns the whole table', () => {
    expect(m.qa('c')).toHaveLength(5);
  });

  test('ql returns lines for an order, empty array when none', () => {
    expect(m.ql(1001)).toEqual([
      { oid: 1001, pid: 101, q: 200 },
      { oid: 1001, pid: 104, q: 50 },
    ]);
    expect(m.ql(9999)).toEqual([]);
  });

  test('cnt keeps accumulating across calls, never resets', () => {
    m.q('c', 1);
    m.q('c', 2);
    m.qa('p');
    expect(m.cnt()).toBe(3);
  });
});

describe('fmt (money formatting)', () => {
  test.each([
    [1234.5, '$1,234.50'],
    [0, '$0.00'],
    [999.999, '$1,000.00'],
    [1000000, '$1,000,000.00'],
  ])('fmt(%p) === %p', (input, expected) => {
    expect(m.fmt(input)).toBe(expected);
  });
});

describe('calc (order total: discount + tax)', () => {
  test.each([
    [1001, 1433.7],
    [1002, 3318.62],
    [1003, 432], // cancelled order: no tax applied
    [1005, 3011.85], // bulk qty >= 500 adds +3% discount
  ])('calc(%p) === %p', (orderId, expected) => {
    expect(m.calc(orderId)).toBe(expected);
  });
});

describe('chk (order validation)', () => {
  test('returns OK for a normal order', () => {
    expect(m.chk(1001)).toBe('OK');
  });

  test('returns NG: no order for an unknown id', () => {
    expect(m.chk(9999)).toBe('NG: no order');
  });

  test('returns NG: cancelled for a cancelled order', () => {
    expect(m.chk(1003)).toBe('NG: cancelled');
  });

  test.each([1001, 1002, 1004, 1005, 1006, 1007, 1008, 1009, 1010])(
    'order %p currently validates as OK',
    (orderId) => {
      expect(m.chk(orderId)).toBe('OK');
    }
  );
});

describe('getAll (orders by status)', () => {
  test('lists OPEN orders with enriched customer/line info', () => {
    expect(m.getAll('OPEN')).toEqual([
      { id: 1005, date: '2026-02-09', customer: 'Hue Trading', city: 'Hue', lines: 1, units: 500 },
      { id: 1007, date: '2026-02-21', customer: 'Can Tho Apparel', city: 'Can Tho', lines: 2, units: 320 },
      { id: 1009, date: '2026-03-08', customer: 'Hanoi Garment Co', city: 'Hanoi', lines: 1, units: 400 },
    ]);
  });

  test('lists DONE orders', () => {
    const done = m.getAll('DONE');
    expect(done).toHaveLength(6);
    expect(done.map((o) => o.id)).toEqual([1001, 1002, 1004, 1006, 1008, 1010]);
  });

  test('returns empty array for a status with no matches', () => {
    expect(m.getAll('NOPE')).toEqual([]);
  });
});

describe('top (best-selling products, DONE orders only)', () => {
  test('top 3 by units sold', () => {
    expect(m.top(3)).toEqual([
      { name: 'T-Shirt Basic', units: 650 },
      { name: 'Polo Shirt', units: 270 },
      { name: 'Track Shorts', units: 130 },
    ]);
  });

  test('top 1 returns a single entry', () => {
    expect(m.top(1)).toEqual([{ name: 'T-Shirt Basic', units: 650 }]);
  });
});

describe('upd (order status transitions)', () => {
  test('OPEN -> DONE succeeds and returns an audit line', () => {
    expect(m.upd(1005, 'DONE')).toBe('OK|1005|OPEN->DONE|Hue Trading');
  });

  test('cannot reopen a DONE order back to OPEN', () => {
    m.upd(1005, 'DONE');
    expect(m.upd(1005, 'OPEN')).toBe('ERR|1005|cannot reopen');
  });

  test('errors on unknown order id', () => {
    expect(m.upd(9999, 'DONE')).toBe('ERR|9999|no such order');
  });

  test('errors on invalid status value', () => {
    expect(m.upd(1005, 'BAD')).toBe('ERR|1005|bad status BAD');
  });

  test('errors when updating an already-cancelled order', () => {
    expect(m.upd(1003, 'DONE')).toBe('ERR|1003|already cancelled');
  });
});

describe('proc (monthly report)', () => {
  test('renders the full report for a month with orders', () => {
    expect(m.proc('2026-02')).toBe(
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
    expect(m.proc('2099-01')).toBe(
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
