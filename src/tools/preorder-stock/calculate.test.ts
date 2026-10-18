import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('preorder-stock', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"reservations":100,"defectRate":10,"bufferRate":5}).rows.map((row) => row.value);
    const expected = [117,105,105.3];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
