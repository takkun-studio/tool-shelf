import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('cashless-payback', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"monthlySales":500000,"grossMarginRate":40,"feeRate":3.5,"cashlessShare":50,"fixedCost":0,"salesIncreaseRate":10}).rows.map((row) => row.value);
    const expected = [10375,20000,9625,4.575163];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
