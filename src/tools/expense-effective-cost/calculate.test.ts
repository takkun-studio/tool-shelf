import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('expense-effective-cost', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"purchase":100000,"businessRate":80,"estimatedTaxRate":20}).rows.map((row) => row.value);
    const expected = [84000,80000,16000];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
