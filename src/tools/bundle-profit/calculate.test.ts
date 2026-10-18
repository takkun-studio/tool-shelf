import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('bundle-profit', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"itemCostTotal":1800,"packageCost":200,"shipping":450,"sellingPrice":4000,"feeRate":10}).rows.map((row) => row.value);
    const expected = [1150,28.75,400,2723];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
