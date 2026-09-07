import Stripe from 'stripe';
import { describe, expect, it } from 'vitest';
import { checkoutIntegrationIdentifier, handleWebhook, planForPrice, planForSubscription, priceForPlan } from './billing';
const env = { STRIPE_BASIC_PRICE_ID: 'price_basic', STRIPE_STANDARD_PRICE_ID: 'price_standard' } as never;
describe('Stripe entitlement mapping', () => {
  it('creates a Checkout integration identifier with an eight-letter suffix', () => expect(checkoutIntegrationIdentifier()).toMatch(/^tool_shelf_[a-z]{8}$/));
  it('maps only fixed server-side Price IDs', () => { expect(priceForPlan('basic', env)).toBe('price_basic'); expect(priceForPlan('standard', env)).toBe('price_standard'); expect(planForPrice('price_unknown', env)).toBe('free'); });
  it('fails closed when Stripe Price configuration is absent', () => expect(planForPrice(undefined, { STRIPE_BASIC_PRICE_ID: '', STRIPE_STANDARD_PRICE_ID: '' } as never)).toBe('free'));
  it('keeps access through Stripe past_due and fails closed otherwise', () => { expect(planForSubscription('active', 'price_basic', env)).toBe('basic'); expect(planForSubscription('trialing', 'price_standard', env)).toBe('standard'); expect(planForSubscription('past_due', 'price_basic', env)).toBe('basic'); expect(planForSubscription('unpaid', 'price_standard', env)).toBe('free'); expect(planForSubscription('canceled', 'price_standard', env)).toBe('free'); expect(planForSubscription('paused', 'price_standard', env)).toBe('free'); });
});

describe('Stripe webhook boundary', () => {
  const secret = 'whsec_test_only';
  const payload = JSON.stringify({ id: 'evt_test', object: 'event', api_version: '2026-07-29.dahlia', created: 1, data: { object: {} }, livemode: false, pending_webhooks: 1, request: null, type: 'test.event' });
  const setup = () => {
    const seen = new Set<string>(), writes: string[] = [];
    const DB = { prepare: (sql: string) => ({ bind: (eventId: string) => ({ first: async () => seen.has(eventId) ? { event_id: eventId } : null, run: async () => { expect(sql).toContain('INSERT OR IGNORE'); writes.push(eventId); seen.add(eventId); return {}; } }) }) };
    return { seen, writes, env: { DB, STRIPE_SECRET_KEY: 'sk_test_only', STRIPE_WEBHOOK_SECRET: secret, STRIPE_BASIC_PRICE_ID: 'price_basic', STRIPE_STANDARD_PRICE_ID: 'price_standard' } as never };
  };
  const request = (body: string, signature: string) => new Request('https://worker.example/v1/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': signature }, body });

  it('rejects an invalid signature before recording the event', async () => {
    const state = setup(), result = await handleWebhook(request(payload, 't=1,v1=invalid'), state.env);
    expect(result.status).toBe(400);
    expect(state.writes).toHaveLength(0);
  });

  it('verifies the raw body and records a successfully handled event once', async () => {
    const state = setup(), signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect((await handleWebhook(request(payload, signature), state.env)).status).toBe(200);
    expect(await handleWebhook(request(payload, signature), state.env).then((result) => result.body)).toEqual({ received: true, duplicate: true });
    expect(state.writes).toEqual(['evt_test']);
    expect((await handleWebhook(request(`${payload} `, signature), setup().env)).status).toBe(400);
  });
});
