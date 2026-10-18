import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('month-end-cash-forecast', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"currentCash":100000,"incoming":200000,"outgoing":180000,"taxReserve":30000}).rows.map((row) => row.value);
    const expected = [90000,200000,210000];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
