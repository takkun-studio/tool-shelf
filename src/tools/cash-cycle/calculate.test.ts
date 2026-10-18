import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('cash-cycle', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"startingCash":100000,"purchasePerCycle":40000,"revenuePerCycle":55000,"cycles":4}).rows.map((row) => row.value);
    const expected = [160000,4,60000];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
