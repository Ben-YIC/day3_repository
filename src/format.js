// Formatting layer: display-only helpers.
// Accounting wants comma-grouped $ amounts, don't change the output shape.

function formatMoney(n) {
  const s = (Math.round(n * 100) / 100).toFixed(2);
  const [whole, cents] = s.split('.');
  let grouped = '';
  let count = 0;
  for (let i = whole.length - 1; i >= 0; i--) {
    grouped = whole[i] + grouped;
    count++;
    if (count % 3 === 0 && i > 0) {
      grouped = ',' + grouped;
    }
  }
  return '$' + grouped + '.' + cents;
}

module.exports = { formatMoney };
