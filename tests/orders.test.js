// Unit tests for the new business-logic module (src/orders.js), extracted from legacy.js.
let orders;

beforeEach(() => {
  jest.resetModules();
  orders = require('../src/orders');
});

describe('calculateOrderTotal', () => {
  test.each([
    [1001, 1433.7],
    [1002, 3318.62],
    [1003, 432], // cancelled order: no tax applied
    [1005, 3011.85], // bulk qty >= 500 adds +3% discount
  ])('calculateOrderTotal(%p) === %p', (orderId, expected) => {
    expect(orders.calculateOrderTotal(orderId)).toBe(expected);
  });
});

describe('validateOrder', () => {
  test('returns OK for a normal order', () => {
    expect(orders.validateOrder(1001)).toBe('OK');
  });

  test('returns NG: no order for an unknown id', () => {
    expect(orders.validateOrder(9999)).toBe('NG: no order');
  });

  test('returns NG: cancelled for a cancelled order', () => {
    expect(orders.validateOrder(1003)).toBe('NG: cancelled');
  });
});

describe('updateOrderStatus', () => {
  test('OPEN -> DONE succeeds and returns an audit line', () => {
    expect(orders.updateOrderStatus(1005, 'DONE')).toBe('OK|1005|OPEN->DONE|Hue Trading');
  });

  test('cannot reopen a DONE order back to OPEN', () => {
    orders.updateOrderStatus(1005, 'DONE');
    expect(orders.updateOrderStatus(1005, 'OPEN')).toBe('ERR|1005|cannot reopen');
  });

  test('errors on unknown order id', () => {
    expect(orders.updateOrderStatus(9999, 'DONE')).toBe('ERR|9999|no such order');
  });

  test('errors on invalid status value', () => {
    expect(orders.updateOrderStatus(1005, 'BAD')).toBe('ERR|1005|bad status BAD');
  });

  test('errors when updating an already-cancelled order', () => {
    expect(orders.updateOrderStatus(1003, 'DONE')).toBe('ERR|1003|already cancelled');
  });
});
