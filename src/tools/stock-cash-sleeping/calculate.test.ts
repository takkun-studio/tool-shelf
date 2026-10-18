import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('stock-cash-sleeping', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"stock":37,"unitCost":850}).rows.map((row) => row.value);
    const expected = [31450,37,850];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
