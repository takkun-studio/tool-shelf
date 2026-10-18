import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('free-shipping-threshold', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"averageCostRate":40,"feeRate":10,"shipping":600,"targetProfit":1000}).rows.map((row) => row.value);
    const expected = [3200,600,1000];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
