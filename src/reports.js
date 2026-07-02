// Reporting layer: listings and the monthly report, built on top of
// the data access layer, business logic layer, and formatting layer.

const db = require('./db');
const { formatMoney } = require('./format');
const { calculateOrderTotal } = require('./orders');

// orders by status, with names attached
function listOrdersByStatus(status) {
  const allOrders = db.getAllRows('o');
  const result = [];
  for (let i = 0; i < allOrders.length; i++) {
    if (allOrders[i].s === status) {
      const customer = db.getById('c', allOrders[i].cid);
      const lines = db.getOrderLines(allOrders[i].id);
      let totalQty = 0;
      for (let j = 0; j < lines.length; j++) {
        totalQty += lines[j].q;
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
  const allOrders = db.getAllRows('o');
  const unitsByName = {};
  for (let i = 0; i < allOrders.length; i++) {
    if (allOrders[i].s !== 'DONE') {
      continue;
    }
    const lines = db.getOrderLines(allOrders[i].id);
    for (let j = 0; j < lines.length; j++) {
      const product = db.getById('p', lines[j].pid);
      if (unitsByName[product.n] === undefined) {
        unitsByName[product.n] = 0;
      }
      unitsByName[product.n] += lines[j].q;
    }
  }
  const sorted = [];
  for (const name in unitsByName) {
    sorted.push({ name, units: unitsByName[name] });
  }
  sorted.sort((a, b) => b.units - a.units);
  return sorted.slice(0, n);
}

// monthly report. month = 'YYYY-MM'
function generateMonthlyReport(month) {
  const allOrders = db.getAllRows('o');
  let report = '';
  report += '==========================================\n';
  report += ' MONTHLY ORDER REPORT  ' + month + '\n';
  report += '==========================================\n';
  let grandTotal = 0;
  let countedOrders = 0;
  for (let i = 0; i < allOrders.length; i++) {
    const order = allOrders[i];
    if (order.dt.substring(0, 7) !== month) {
      continue;
    }
    const customer = db.getById('c', order.cid);
    const lines = db.getOrderLines(order.id);
    report += '\nOrder #' + order.id + '  [' + order.s + ']  ' + order.dt + '\n';
    report += '  Customer: ' + customer.n + ' (' + customer.ct + ', tier ' + customer.t + ')\n';
    let subtotal = 0;
    for (let j = 0; j < lines.length; j++) {
      const product = db.getById('p', lines[j].pid);
      const lineTotal = product.pr * lines[j].q;
      subtotal += lineTotal;
      report += '    ' + product.n + '  x' + lines[j].q + '  @ ' + formatMoney(product.pr) + '  = ' + formatMoney(lineTotal) + '\n';
    }
    if (order.s !== 'CANCEL') {
      const total = calculateOrderTotal(order.id);
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

module.exports = { listOrdersByStatus, topSellingProducts, generateMonthlyReport };
