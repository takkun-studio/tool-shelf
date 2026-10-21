import { describe, expect, it } from 'vitest';
import { accessibleToolCount, canAccessTool } from './access';
import { tools } from './tools';
import { shelfLimit, moveShelf } from './shelf';

describe('open calculators and configurable shelf', () => {
  it('allows every public calculator on every real plan', () => {
    for (const plan of ['free','basic','standard','unlimited']) {
      expect(accessibleToolCount(plan)).toBe(10);
      for (const tool of tools) expect(canAccessTool(plan,tool.id)).toBe(true);
    }
  });
  it('refuses unknown plan and hidden/unknown tool IDs', () => {
    expect(canAccessTool('other','profit')).toBe(false);
    expect(canAccessTool('free','tax-reserve')).toBe(false);
    expect(canAccessTool('free','not-a-calculator')).toBe(false);
  });
  it('limits shelf capacity rather than calculator use', () => {
    expect(shelfLimit).toEqual({ free:3, basic:5, standard:10 });
    expect(moveShelf(['profit','market','target'], 'market', -1)).toEqual(['market','profit','target']);
    expect(moveShelf(['profit','market'], 'profit', -1)).toEqual(['profit','market']);
  });
});
