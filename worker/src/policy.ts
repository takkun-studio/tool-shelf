import type { BackendPlan } from './calculators';
export type { BackendPlan } from './calculators';

const entitledSubscriptionStatuses = new Set(['active', 'trialing', 'past_due']);

export const planFromUnknown = (value: unknown): BackendPlan =>
  value === 'basic' || value === 'standard' ? value : 'free';

export const isEntitledSubscriptionStatus = (value: unknown): value is 'active' | 'trialing' | 'past_due' =>
  typeof value === 'string' && entitledSubscriptionStatuses.has(value);

export const planFromStripeState = (
  status: unknown,
  priceId: unknown,
  basicPriceId: string,
  standardPriceId: string,
): BackendPlan => {
  if (!isEntitledSubscriptionStatus(status) || typeof priceId !== 'string' || !priceId) return 'free';
  if (basicPriceId && priceId === basicPriceId) return 'basic';
  if (standardPriceId && priceId === standardPriceId) return 'standard';
  return 'free';
};
