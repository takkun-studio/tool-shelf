import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('price-increase-impact', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"currentPrice":1000,"newPrice":1200,"currentQuantity":100,"decreaseRate":10,"unitCost":400,"feeRate":10}).rows.map((row) => row.value);
    const expected = [9900,50000,59900,90,25];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
