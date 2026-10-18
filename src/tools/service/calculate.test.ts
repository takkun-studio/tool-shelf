import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';
describe('service tool', () => { it('matches existing result', () => {
  expect(calculate({ hourlyRate:2000, hours:3, expenses:500 }).rows.map(row => row.value)).toEqual([6500, 6000, 500]);
}); });
