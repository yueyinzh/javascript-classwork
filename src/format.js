const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function formatCurrency(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new TypeError('Amount must be a finite number.');
  }

  return usdFormatter.format(amount);
}
