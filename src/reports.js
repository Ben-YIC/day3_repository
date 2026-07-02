// Reporting layer: listings and the monthly report, built on top of
// the data access layer, business logic layer, and formatting layer.

var db = require('./db');
var formatMoney = require('./format').formatMoney;
var calculateOrderTotal = require('./orders').calculateOrderTotal;

// orders by status, with names attached
function listOrdersByStatus(status) {
  var allOrders = db.getAllRows('o');
  var result = [];
  for (var i = 0; i < allOrders.length; i++) {
    if (allOrders[i].s === status) {
      var customer = db.getById('c', allOrders[i].cid);
      var lines = db.getOrderLines(allOrders[i].id);
      var totalQty = 0;
      for (var j = 0; j < lines.length; j++) {
        totalQty = totalQty + lines[j].q;
      }
      result.push({
        id: allOrders[i].id,
        date: allOrders[i].dt,
        customer: customer.n,
        city: customer.ct,
        lines: lines.length,
        units: totalQty
      });
    }
  }
  return result;
}

// top n products by units sold (DONE orders only)
function topSellingProducts(n) {
  var allOrders = db.getAllRows('o');
  var unitsByName = {};
  for (var i = 0; i < allOrders.length; i++) {
    if (allOrders[i].s !== 'DONE') {
      continue;
    }
    var lines = db.getOrderLines(allOrders[i].id);
    for (var j = 0; j < lines.length; j++) {
      var product = db.getById('p', lines[j].pid);
      if (unitsByName[product.n] === undefined) {
        unitsByName[product.n] = 0;
      }
      unitsByName[product.n] = unitsByName[product.n] + lines[j].q;
    }
  }
  var sorted = [];
  for (var name in unitsByName) {
    sorted.push({ name: name, units: unitsByName[name] });
  }
  sorted.sort(function (a, b) {
    return b.units - a.units;
  });
  return sorted.slice(0, n);
}

// monthly report. month = 'YYYY-MM'
function generateMonthlyReport(month) {
  var allOrders = db.getAllRows('o');
  var report = '';
  report += '==========================================\n';
  report += ' MONTHLY ORDER REPORT  ' + month + '\n';
  report += '==========================================\n';
  var grandTotal = 0;
  var countedOrders = 0;
  for (var i = 0; i < allOrders.length; i++) {
    var order = allOrders[i];
    if (order.dt.substring(0, 7) !== month) {
      continue;
    }
    var customer = db.getById('c', order.cid);
    var lines = db.getOrderLines(order.id);
    report += '\nOrder #' + order.id + '  [' + order.s + ']  ' + order.dt + '\n';
    report += '  Customer: ' + customer.n + ' (' + customer.ct + ', tier ' + customer.t + ')\n';
    var subtotal = 0;
    for (var j = 0; j < lines.length; j++) {
      var product = db.getById('p', lines[j].pid);
      var lineTotal = product.pr * lines[j].q;
      subtotal += lineTotal;
      report += '    ' + product.n + '  x' + lines[j].q + '  @ ' + formatMoney(product.pr) + '  = ' + formatMoney(lineTotal) + '\n';
    }
    if (order.s !== 'CANCEL') {
      var total = calculateOrderTotal(order.id);
      report += '  Subtotal: ' + formatMoney(subtotal) + '   Total(incl. disc+tax): ' + formatMoney(total) + '\n';
      grandTotal += total;
      countedOrders++;
    } else {
      report += '  ** CANCELLED — excluded from totals **\n';
    }
  }
  report += '\n------------------------------------------\n';
  report += ' Orders counted: ' + countedOrders + '\n';
  report += ' Grand total:    ' + formatMoney(grandTotal) + '\n';
  report += '==========================================\n';
  return report;
}

module.exports = {
  listOrdersByStatus: listOrdersByStatus,
  topSellingProducts: topSellingProducts,
  generateMonthlyReport: generateMonthlyReport
};
