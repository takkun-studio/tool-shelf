import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('invoice-impact', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"purchaseTaxIncluded":110000,"taxRate":10,"creditRate":50}).rows.map((row) => row.value);
    const expected = [5000,10000,5000,50];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
