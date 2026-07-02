// Business logic layer: order totals, validation, status transitions.

const db = require('./db');

// total for one order. discount: tier from customer, also bulk >=500 units extra 3%
function calculateOrderTotal(orderId) {
  const lines = db.getOrderLines(orderId);
  let total = 0;
  let totalQty = 0;
  for (let i = 0; i < lines.length; i++) {
    const product = db.getById('p', lines[i].pid);
    total += product.pr * lines[i].q;
    totalQty += lines[i].q;
  }
  const order = db.getById('o', orderId);
  const customer = db.getById('c', order.cid);
  let discount = customer.d;
  if (totalQty >= 500) {
    discount += 0.03;
  }
  total -= total * discount;
  // tax 8% but not for cancelled obviously
  if (order.s !== 'CANCEL') {
    total *= 1.08;
  }
  return Math.round(total * 100) / 100;
}

// is order ok
function validateOrder(orderId) {
  const order = db.getById('o', orderId);
  if (order == null) {
    return 'NG: no order';
  }
  if (order.s === 'CANCEL') {
    return 'NG: cancelled';
  }
  const lines = db.getOrderLines(orderId);
  if (lines.length === 0) {
    return 'NG: empty';
  }
  for (let i = 0; i < lines.length; i++) {
    const product = db.getById('p', lines[i].pid);
    if (product == null) {
      return 'NG: bad product ' + lines[i].pid;
    }
    if (lines[i].q <= 0) {
      return 'NG: bad qty';
    }
    if (lines[i].q > product.st) {
      return 'NG: not enough stock for ' + product.n;
    }
  }
  return 'OK';
}

// update order status. returns log line for audit (dat said keep the format)
function updateOrderStatus(orderId, newStatus) {
  const order = db.getById('o', orderId);
  if (order == null) {
    return 'ERR|' + orderId + '|no such order';
  }
  if (newStatus !== 'OPEN' && newStatus !== 'DONE' && newStatus !== 'CANCEL') {
    return 'ERR|' + orderId + '|bad status ' + newStatus;
  }
  if (order.s === 'CANCEL') {
    return 'ERR|' + orderId + '|already cancelled';
  }
  if (order.s === 'DONE' && newStatus === 'OPEN') {
    return 'ERR|' + orderId + '|cannot reopen';
  }
  const oldStatus = order.s;
  order.s = newStatus;
  const customer = db.getById('c', order.cid);
  return 'OK|' + orderId + '|' + oldStatus + '->' + newStatus + '|' + customer.n;
}

module.exports = { calculateOrderTotal, validateOrder, updateOrderStatus };
