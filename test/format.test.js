import { describe, expect, it } from 'vitest';

import { formatCurrency } from '../src/format.js';

describe('formatCurrency', () => {
  it('formats whole and decimal amounts as US dollars', () => {
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(5.25)).toBe('$5.25');
  });

  it('rejects non-finite values', () => {
    expect(() => formatCurrency(Number.NaN)).toThrow(TypeError);
    expect(() => formatCurrency(Infinity)).toThrow(TypeError);
  });
});
