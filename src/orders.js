// Business logic layer: order totals, validation, status transitions.

var db = require('./db');

// total for one order. discount: tier from customer, also bulk >=500 units extra 3%
function calculateOrderTotal(orderId) {
  var lines = db.getOrderLines(orderId);
  var total = 0;
  var totalQty = 0;
  for (var i = 0; i < lines.length; i++) {
    var product = db.getById('p', lines[i].pid);
    total = total + product.pr * lines[i].q;
    totalQty = totalQty + lines[i].q;
  }
  var order = db.getById('o', orderId);
  var customer = db.getById('c', order.cid);
  var discount = customer.d;
  if (totalQty >= 500) {
    discount = discount + 0.03;
  }
  total = total - total * discount;
  // tax 8% but not for cancelled obviously
  if (order.s !== 'CANCEL') {
    total = total * 1.08;
  }
  return Math.round(total * 100) / 100;
}

// is order ok
function validateOrder(orderId) {
  var order = db.getById('o', orderId);
  if (order == null) {
    return 'NG: no order';
  }
  if (order.s === 'CANCEL') {
    return 'NG: cancelled';
  }
  var lines = db.getOrderLines(orderId);
  if (lines.length === 0) {
    return 'NG: empty';
  }
  for (var i = 0; i < lines.length; i++) {
    var product = db.getById('p', lines[i].pid);
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
  var order = db.getById('o', orderId);
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
  var oldStatus = order.s;
  order.s = newStatus;
  var customer = db.getById('c', order.cid);
  return 'OK|' + orderId + '|' + oldStatus + '->' + newStatus + '|' + customer.n;
}

module.exports = { calculateOrderTotal: calculateOrderTotal, validateOrder: validateOrder, updateOrderStatus: updateOrderStatus };
