import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('withholding-net', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"desiredNet":897900,"lowRate":10.21,"highRate":20.42,"threshold":1000000}).rows.map((row) => row.value);
    const expected = [1000000,102100,897900];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
