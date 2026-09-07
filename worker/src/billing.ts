import Stripe from 'stripe';
import type { Env } from './auth';
import { isEntitledSubscriptionStatus, planFromStripeState, type BackendPlan } from './policy';

type BillablePlan = 'basic' | 'standard';
type Entitlement = { plan: BackendPlan; stripe_customer_id: string | null; stripe_subscription_id: string | null; stripe_price_id: string | null; subscription_status: string | null; current_period_end: number | null; cancel_at_period_end: number };
const rank: Record<BackendPlan, number> = { free: 0, basic: 1, standard: 2 };
export const isBillablePlan = (value: unknown): value is BillablePlan => value === 'basic' || value === 'standard';
export const priceForPlan = (plan: BillablePlan, env: Env) => plan === 'basic' ? env.STRIPE_BASIC_PRICE_ID : env.STRIPE_STANDARD_PRICE_ID;
export const planForPrice = (priceId: string | null | undefined, env: Env): BackendPlan => planFromStripeState('active', priceId, env.STRIPE_BASIC_PRICE_ID, env.STRIPE_STANDARD_PRICE_ID);
export const planForSubscription = (status: string, priceId: string | null | undefined, env: Env): BackendPlan => planFromStripeState(status, priceId, env.STRIPE_BASIC_PRICE_ID, env.STRIPE_STANDARD_PRICE_ID);
const client = (env: Env) => new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-07-29.dahlia', httpClient: Stripe.createFetchHttpClient() });
export const checkoutIntegrationIdentifier = () => {
  const random = crypto.getRandomValues(new Uint8Array(8));
  return `tool_shelf_${Array.from(random, (value) => String.fromCharCode(97 + value % 26)).join('')}`;
};
const customerIdOf = (customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) => typeof customer === 'string' ? customer : customer?.id ?? null;
const entitlementFor = (env: Env, userId: string) => env.DB.prepare('SELECT plan, stripe_customer_id, stripe_subscription_id, stripe_price_id, subscription_status, current_period_end, cancel_at_period_end FROM entitlements WHERE clerk_user_id = ?').bind(userId).first<Entitlement>();

async function setCustomer(env: Env, userId: string, customerId: string) {
  await env.DB.prepare("INSERT INTO entitlements (clerk_user_id, plan, stripe_customer_id) VALUES (?, 'free', ?) ON CONFLICT(clerk_user_id) DO UPDATE SET stripe_customer_id = excluded.stripe_customer_id, updated_at = CURRENT_TIMESTAMP").bind(userId, customerId).run();
}
export async function customerForUser(env: Env, userId: string) {
  const existing = await entitlementFor(env, userId);
  const stripe = client(env);
  if (existing?.stripe_customer_id) {
    const customer = await stripe.customers.retrieve(existing.stripe_customer_id);
    if (!customer.deleted && customer.metadata.clerk_user_id === userId) return customer.id;
    throw new Error('customer_not_found');
  }
  const customer = await stripe.customers.create({ metadata: { clerk_user_id: userId } }, { idempotencyKey: `tool-shelf:customer:${userId}` });
  await setCustomer(env, userId, customer.id);
  return customer.id;
}
export async function checkoutForUser(env: Env, userId: string, plan: BillablePlan, origin: string) {
  const existing = await entitlementFor(env, userId);
  if (existing?.stripe_subscription_id && isEntitledSubscriptionStatus(existing.subscription_status)) throw new Error('active_subscription');
  const stripe = client(env), customer = await customerForUser(env, userId);
  return stripe.checkout.sessions.create({ mode: 'subscription', customer, client_reference_id: userId, integration_identifier: checkoutIntegrationIdentifier(), line_items: [{ price: priceForPlan(plan, env), quantity: 1 }], success_url: `${origin}/account?checkout=success`, cancel_url: `${origin}/pricing?checkout=cancelled`, metadata: { clerk_user_id: userId, selected_plan: plan }, subscription_data: { metadata: { clerk_user_id: userId, selected_plan: plan } } });
}
export async function portalForUser(env: Env, userId: string, origin: string) {
  const existing = await entitlementFor(env, userId);
  if (!existing?.stripe_customer_id) throw new Error('customer_not_found');
  const stripe = client(env), customer = await stripe.customers.retrieve(existing.stripe_customer_id);
  if (customer.deleted || customer.metadata.clerk_user_id !== userId) throw new Error('customer_not_found');
  return stripe.billingPortal.sessions.create({ customer: customer.id, configuration: env.STRIPE_PORTAL_CONFIGURATION_ID, return_url: `${origin}/account` });
}
export async function billingStatus(env: Env, userId: string) {
  const existing = await entitlementFor(env, userId);
  const plan = existing?.stripe_subscription_id ? planForSubscription(existing.subscription_status ?? '', existing.stripe_price_id, env) : 'free';
  return { plan, subscriptionStatus: existing?.subscription_status ?? null, currentPeriodEnd: existing?.current_period_end ?? null, cancelAtPeriodEnd: !!existing?.cancel_at_period_end, hasCustomer: !!existing?.stripe_customer_id };
}
export async function reconcileCustomer(env: Env, customerId: string) {
  const owner = await env.DB.prepare('SELECT clerk_user_id FROM entitlements WHERE stripe_customer_id = ?').bind(customerId).first<{ clerk_user_id: string }>();
  if (!owner) return;
  const stripe = client(env), customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted || customer.metadata.clerk_user_id !== owner.clerk_user_id) throw new Error('customer_identity_mismatch');
  const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 100 });
  const candidates = subscriptions.data.flatMap((subscription) => subscription.items.data.map((item) => {
    const priceId = item.price.id, plan = planForSubscription(subscription.status, priceId, env);
    return { subscription, priceId, plan, periodEnd: item.current_period_end ?? null };
  })).filter((item) => item.plan !== 'free').sort((a, b) => rank[b.plan] - rank[a.plan] || (b.periodEnd ?? 0) - (a.periodEnd ?? 0));
  const chosen = candidates[0];
  await env.DB.prepare("INSERT INTO entitlements (clerk_user_id, plan, stripe_customer_id, stripe_subscription_id, stripe_price_id, subscription_status, current_period_end, cancel_at_period_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(clerk_user_id) DO UPDATE SET plan = excluded.plan, stripe_customer_id = excluded.stripe_customer_id, stripe_subscription_id = excluded.stripe_subscription_id, stripe_price_id = excluded.stripe_price_id, subscription_status = excluded.subscription_status, current_period_end = excluded.current_period_end, cancel_at_period_end = excluded.cancel_at_period_end, updated_at = CURRENT_TIMESTAMP").bind(owner.clerk_user_id, chosen?.plan ?? 'free', customer.id, chosen?.subscription.id ?? null, chosen?.priceId ?? null, chosen?.subscription.status ?? 'canceled', chosen?.periodEnd ?? null, chosen?.subscription.cancel_at_period_end ? 1 : 0).run();
}
export async function handleWebhook(request: Request, env: Env) {
  if (request.method !== 'POST') return { status: 405, body: { error: 'Method not allowed' } };
  const signature = request.headers.get('stripe-signature');
  if (!signature) return { status: 400, body: { error: '署名が不正です' } };
  let event: Stripe.Event;
  try { event = await client(env).webhooks.constructEventAsync(await request.text(), signature, env.STRIPE_WEBHOOK_SECRET, undefined, Stripe.createSubtleCryptoProvider()); } catch { return { status: 400, body: { error: '署名が不正です' } }; }
  const seen = await env.DB.prepare('SELECT event_id FROM webhook_events WHERE event_id = ?').bind(event.id).first();
  if (seen) return { status: 200, body: { received: true, duplicate: true } };
  const supported = new Set(['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'customer.subscription.paused', 'customer.subscription.resumed', 'invoice.paid', 'invoice.payment_failed']);
  if (supported.has(event.type)) {
    const object = event.data.object as unknown as { customer?: string | { id: string } | null };
    const customerId = customerIdOf(object.customer ?? null);
    if (customerId) await reconcileCustomer(env, customerId);
  }
  await env.DB.prepare('INSERT OR IGNORE INTO webhook_events (event_id) VALUES (?)').bind(event.id).run();
  return { status: 200, body: { received: true } };
}
