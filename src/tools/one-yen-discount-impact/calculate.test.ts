import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('one-yen-discount-impact', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"currentPrice":1000,"monthlyQuantity":100,"discountAmount":10,"feeRate":10}).rows.map((row) => row.value);
    const expected = [900,1000,100,990];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
