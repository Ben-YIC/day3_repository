// Unit tests for the new formatting module (src/format.js), extracted from legacy.js.
const { formatMoney } = require('../src/format');

test.each([
  [1234.5, '$1,234.50'],
  [0, '$0.00'],
  [999.999, '$1,000.00'],
  [1000000, '$1,000,000.00'],
])('formatMoney(%p) === %p', (input, expected) => {
  expect(formatMoney(input)).toBe(expected);
});
