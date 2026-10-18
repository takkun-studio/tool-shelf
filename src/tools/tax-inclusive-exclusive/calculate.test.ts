import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('tax-inclusive-exclusive', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"amount":1100,"taxRate":10,"direction":1,"rounding":0}).rows.map((row) => row.value);
    const expected = [1000,100];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
