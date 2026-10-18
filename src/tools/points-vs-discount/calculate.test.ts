import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('points-vs-discount', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"price":10000,"discountRate":10,"pointRate":10,"pointUseRate":70,"pointCostRate":100}).rows.map((row) => row.value);
    const expected = [300,1000,700];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
