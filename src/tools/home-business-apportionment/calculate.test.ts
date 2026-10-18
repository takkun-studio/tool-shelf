import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('home-business-apportionment', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"totalCost":100000,"businessRate":30}).rows.map((row) => row.value);
    const expected = [30000,70000];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
