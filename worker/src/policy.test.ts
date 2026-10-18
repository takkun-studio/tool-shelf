import { describe, expect, it } from 'vitest';
import { planFromStripeState, planFromUnknown } from './policy';

describe('backend plan policy', () => {
  it('accepts only known internal plans', () => {
    expect(planFromUnknown('basic')).toBe('basic');
    expect(planFromUnknown('standard')).toBe('standard');
    expect(planFromUnknown('unlimited')).toBe('free');
    expect(planFromUnknown('standard-from-client')).toBe('free');
  });

  it('derives a paid plan only from entitled Stripe status and fixed Price ID', () => {
    expect(planFromStripeState('active', 'price_basic', 'price_basic', 'price_standard')).toBe('basic');
    expect(planFromStripeState('trialing', 'price_standard', 'price_basic', 'price_standard')).toBe('standard');
    expect(planFromStripeState('past_due', 'price_standard', 'price_basic', 'price_standard')).toBe('standard');
    expect(planFromStripeState('unpaid', 'price_standard', 'price_basic', 'price_standard')).toBe('free');
    expect(planFromStripeState('canceled', 'price_basic', 'price_basic', 'price_standard')).toBe('free');
    expect(planFromStripeState('active', 'price_unknown', 'price_basic', 'price_standard')).toBe('free');
    expect(planFromStripeState('active', undefined, '', '')).toBe('free');
  });
});
