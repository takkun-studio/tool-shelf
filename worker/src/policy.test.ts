import { describe, expect, it } from 'vitest';
import { tools } from '../../src/lib/tools';
import { planFromStripeState, planFromUnknown } from './policy';
import { canUsePro, PRO_BASIC_LIMIT } from './pro';

const all = tools.map((tool) => tool.id);
describe('PRO entitlement policy', () => {
  it('never grants PRO to anonymous or free users', () => {
    for (const id of all) {
      expect(canUsePro(null, 'standard', id, all)).toBe(false);
      expect(canUsePro('user_1', 'free', id, all)).toBe(false);
    }
  });
  it('grants Basic only for exactly its chosen tools, not the former two fixed tools', () => {
    const selected = ['profit', 'inventory', 'service', 'channel', 'market'];
    expect(selected).toHaveLength(PRO_BASIC_LIMIT);
    for (const id of all) expect(canUsePro('user_1', 'basic', id, selected)).toBe(selected.includes(id));
  });
  it('grants Standard PRO to every current and future registered calculator', () => {
    for (const id of all) expect(canUsePro('user_1', 'standard', id, [])).toBe(true);
  });
  it('does not grant unknown or forged tool ids', () => {
    expect(canUsePro('user_1', 'standard', 'unknown', [])).toBe(false);
    expect(canUsePro('user_1', 'basic', 'unknown', ['unknown'])).toBe(false);
    expect(planFromUnknown('unlimited')).toBe('free');
  });
  it('derives plan from server-side Stripe status and configured Price IDs only', () => {
    expect(planFromStripeState('active', 'price_basic', 'price_basic', 'price_standard')).toBe('basic');
    expect(planFromStripeState('past_due', 'price_standard', 'price_basic', 'price_standard')).toBe('standard');
    expect(planFromStripeState('unpaid', 'price_standard', 'price_basic', 'price_standard')).toBe('free');
    expect(planFromStripeState('canceled', 'price_basic', 'price_basic', 'price_standard')).toBe('free');
    expect(planFromStripeState('active', 'unknown_price', 'price_basic', 'price_standard')).toBe('free');
  });
});
