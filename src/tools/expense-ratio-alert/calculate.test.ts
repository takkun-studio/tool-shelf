import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('expense-ratio-alert', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"sales":500000,"expenses":200000,"alertRate":35}).rows.map((row) => row.value);
    const expected = [40,200000,35];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
