// Formatting layer: display-only helpers.
// Accounting wants comma-grouped $ amounts, don't change the output shape.

function formatMoney(n) {
  var s = (Math.round(n * 100) / 100).toFixed(2);
  var p = s.split('.');
  var x = '';
  var c = 0;
  for (var i = p[0].length - 1; i >= 0; i--) {
    x = p[0][i] + x;
    c++;
    if (c % 3 === 0 && i > 0) {
      x = ',' + x;
    }
  }
  return '$' + x + '.' + p[1];
}

module.exports = { formatMoney };
