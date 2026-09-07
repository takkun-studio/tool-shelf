import { expect, it } from 'vitest'; import { fallbackPlan } from './auth-state';
it('uses free as the unauthenticated plan fallback',()=>expect(fallbackPlan).toBe('free'));
