import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('coupon-safety', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"price":3000,"couponRate":15,"cost":1200,"shipping":400,"feeRate":10,"fixedFee":0,"other":100}).rows.map((row) => row.value);
    const expected = [595,2550,37.037037,1888.888889];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
