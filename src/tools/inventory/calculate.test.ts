import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';
describe('inventory tool', () => { it('matches existing result', () => {
  expect(calculate({ stock:20, unitCost:300, monthlySales:8 }).rows.map(row => row.value)).toEqual([6000, 20, 2.5, 8]);
}); });
