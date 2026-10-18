import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('tax-reserve', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"profit":300000,"reserveRate":25}).rows.map((row) => row.value);
    const expected = [75000,225000,25];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
