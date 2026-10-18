import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('sell-to-go-home', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"fixedCost":10000,"currentContribution":6400,"unitMargin":900}).rows.map((row) => row.value);
    const expected = [4,3600];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
