import { isPaidToolId, paidToolSpecs, type BackendPlan, type PaidToolId } from './calculators';
export type { BackendPlan } from './calculators';
const rank: Record<BackendPlan, number> = { free: 0, basic: 1, standard: 2 };
const entitledSubscriptionStatuses = new Set(['active', 'trialing', 'past_due']);
export const planFromUnknown = (value: unknown): BackendPlan => value === 'basic' || value === 'standard' ? value : 'free';
export const isEntitledSubscriptionStatus = (value: unknown): value is 'active' | 'trialing' | 'past_due' => typeof value === 'string' && entitledSubscriptionStatuses.has(value);
export const planFromStripeState = (status: unknown, priceId: unknown, basicPriceId: string, standardPriceId: string): BackendPlan => {
  if (!isEntitledSubscriptionStatus(status) || typeof priceId !== 'string' || !priceId) return 'free';
  if (basicPriceId && priceId === basicPriceId) return 'basic';
  if (standardPriceId && priceId === standardPriceId) return 'standard';
  return 'free';
};
export const canAccessPaidTool = (plan: unknown, toolId: unknown): boolean => typeof toolId === 'string' && isPaidToolId(toolId) && rank[planFromUnknown(plan)] >= rank[paidToolSpecs[toolId].minimumPlan];
export const authorizationStatus = (userId: string | null, plan: unknown, toolId: unknown): 200 | 401 | 403 => !userId ? 401 : canAccessPaidTool(plan, toolId) ? 200 : 403;
export const requiredPlan = (toolId: PaidToolId) => paidToolSpecs[toolId].minimumPlan;
