import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('bonus-cost-alert', () => {
  it('matches reviewed calculation vector', () => {
    const actual = calculate({"orders":100,"bagCost":30,"stickerCost":20,"sampleCost":50,"otherCost":10}).rows.map((row) => row.value);
    const expected = [11000,110,100];
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, index) => {
      if (typeof value === 'number' && typeof expected[index] === 'number') expect(value).toBeCloseTo(expected[index] as number, 4);
      else expect(value).toBe(expected[index]);
    });
  });
});
