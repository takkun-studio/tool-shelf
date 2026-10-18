import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('fixed-asset-comparison', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"purchase":240000,"businessRate":75,"years":3}).rows.map((row) => row.value);
    const expected = [240000,180000,60000,5000];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
