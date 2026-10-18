import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('discount tool', () => {
  it('matches existing result', () => {
    const values = calculate({ listPrice:1000, discountRate:20, cost:400, shipping:100, feeRate:10, fixedFee:0, other:0 }).rows.map(row => row.value);
    expect(values[0]).toBe(800);
    expect(values[1]).toBe(220);
    expect(values[2]).toBeCloseTo(27.5);
    expect(values[3]).toBe(80);
    expect(values[4]).toBe(556);
  });
});
