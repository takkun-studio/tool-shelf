import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('job-acceptance', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"fee":30000,"workHours":5,"travelHours":1.5,"expenses":4000,"reserveRate":20}).rows.map((row) => row.value);
    const expected = [3200,20800,5200,6.5];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
