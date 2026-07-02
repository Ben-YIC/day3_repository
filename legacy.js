// Public API facade for the order report module.
// Implementation now lives in ./src (db, orders, reports, format); this
// file exists so existing callers/tests using the original short names
// keep working.

var db = require('./src/db');
var fmt = require('./src/format').formatMoney;
var ordersModule = require('./src/orders');
var reports = require('./src/reports');

module.exports = {
  q: db.getById,
  qa: db.getAllRows,
  ql: db.getOrderLines,
  cnt: db.getQueryCount,
  fmt: fmt,
  calc: ordersModule.calculateOrderTotal,
  chk: ordersModule.validateOrder,
  upd: ordersModule.updateOrderStatus,
  proc: reports.generateMonthlyReport,
  getAll: reports.listOrdersByStatus,
  top: reports.topSellingProducts
};
