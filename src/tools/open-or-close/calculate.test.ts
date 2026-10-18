import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('open-or-close', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"expectedSales":30000,"variableCostRate":40,"travel":1000,"staffing":8000,"otherOpenCost":2000}).rows.map((row) => row.value);
    const expected = [7000,18334,11000];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
