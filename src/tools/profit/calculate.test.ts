import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('profit tool', () => {
  it('calculates profit and break-even price', () => {
    expect(calculate({ price:1000, cost:400, shipping:100, feeRate:10, fixedFee:0, other:0 }).rows.map(row => row.value))
      .toEqual([400, 40, 600, 100, 60, 556]);
  });
  it('does not calculate break-even at 100% fee', () => {
    expect(calculate({ price:0, cost:0, shipping:0, feeRate:100, fixedFee:0, other:0 }).rows.at(-1)?.value).toBeNull();
  });
});
