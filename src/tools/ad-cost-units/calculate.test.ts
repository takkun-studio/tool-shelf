import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('ad-cost-units', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"adSpend":10000,"profitPerSale":1200}).rows.map((row) => row.value);
    const expected = [9,10800,10000];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
