import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';

describe('breakeven tool', () => {
  it('calculates quantity and sales', () => {
    expect(calculate({ price:1000, variableCost:400, fixedCost:3000 }).rows.map(row => row.value))
      .toEqual([600, 60, 5, 5000]);
  });
  it('flags non-positive margin', () => {
    expect(calculate({ price:400, variableCost:400, fixedCost:1 }).status).toContain('回収');
  });
});
