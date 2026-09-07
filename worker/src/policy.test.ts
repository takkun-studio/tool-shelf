import { describe, expect, it } from 'vitest';
import { paidToolSpecs, type PaidToolId } from './calculators';
import { authorizationStatus, canAccessPaidTool, planFromStripeState, planFromUnknown } from './policy';
const toolIds = Object.keys(paidToolSpecs) as PaidToolId[];
describe('backend entitlement policy', () => {
  it.each(toolIds)('%s returns 401 without an authenticated user', (toolId) => expect(authorizationStatus(null, 'standard', toolId)).toBe(401));
  it.each(toolIds)('%s rejects free users', (toolId) => expect(authorizationStatus('user_1', 'free', toolId)).toBe(403));
  it('permits Basic only for the two Basic tools', () => { expect(canAccessPaidTool('basic', 'discount')).toBe(true); expect(canAccessPaidTool('basic', 'payout')).toBe(true); for (const toolId of toolIds.filter((toolId) => paidToolSpecs[toolId].minimumPlan === 'standard')) expect(authorizationStatus('user_1', 'basic', toolId)).toBe(403); });
  it.each(toolIds)('%s permits Standard', (toolId) => expect(authorizationStatus('user_1', 'standard', toolId)).toBe(200));
  it('fails closed for forged and unknown values', () => { expect(planFromUnknown('unlimited')).toBe('free'); expect(canAccessPaidTool('standard-from-client', 'discount')).toBe(false); expect(canAccessPaidTool('standard', 'unknown')).toBe(false); });
  it('derives access only from an entitled Stripe status and fixed Price ID', () => { expect(planFromStripeState('active', 'price_basic', 'price_basic', 'price_standard')).toBe('basic'); expect(planFromStripeState('past_due', 'price_standard', 'price_basic', 'price_standard')).toBe('standard'); expect(planFromStripeState('unpaid', 'price_standard', 'price_basic', 'price_standard')).toBe('free'); expect(planFromStripeState('active', 'price_unknown', 'price_basic', 'price_standard')).toBe('free'); expect(planFromStripeState('active', undefined, '', '')).toBe('free'); });
});
