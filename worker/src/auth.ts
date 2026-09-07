import { createRemoteJWKSet, jwtVerify } from 'jose';
import { planFromStripeState, type BackendPlan } from './policy';
export type Env = {
  DB: D1Database;
  CLERK_ISSUER: string;
  CLERK_JWKS_URL: string;
  ALLOWED_ORIGINS: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_BASIC_PRICE_ID: string;
  STRIPE_STANDARD_PRICE_ID: string;
  STRIPE_PORTAL_CONFIGURATION_ID: string;
};
const jwks = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
export const json = (body: unknown, status = 200, headers: HeadersInit = {}) => Response.json(body, { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });
export const cors = (origin: string) => ({ 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization,content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS', vary: 'Origin' });
export const isAllowedOrigin = (origin: string | null, env: Env) => !!origin && env.ALLOWED_ORIGINS.split(',').map((value) => value.trim()).includes(origin);
export async function authenticatedUserId(request: Request, env: Env, origin: string): Promise<string | null> {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;
  const keySet = jwks.get(env.CLERK_JWKS_URL) ?? createRemoteJWKSet(new URL(env.CLERK_JWKS_URL));
  jwks.set(env.CLERK_JWKS_URL, keySet);
  try {
    const { payload } = await jwtVerify(token, keySet, { issuer: env.CLERK_ISSUER, algorithms: ['RS256'] });
    if (typeof payload.sub !== 'string' || payload.azp !== origin) return null;
    await env.DB.prepare('INSERT INTO users (clerk_user_id) VALUES (?) ON CONFLICT(clerk_user_id) DO NOTHING').bind(payload.sub).run();
    return payload.sub;
  } catch { return null; }
}
export async function authenticatedPlan(request: Request, env: Env, origin: string): Promise<{ userId: string; plan: BackendPlan } | null> {
  const userId = await authenticatedUserId(request, env, origin);
  if (!userId) return null;
  const entitlement = await env.DB.prepare('SELECT stripe_subscription_id, stripe_price_id, subscription_status FROM entitlements WHERE clerk_user_id = ?').bind(userId).first<{ stripe_subscription_id: string | null; stripe_price_id: string | null; subscription_status: string | null }>();
  return { userId, plan: entitlement?.stripe_subscription_id ? planFromStripeState(entitlement.subscription_status, entitlement.stripe_price_id, env.STRIPE_BASIC_PRICE_ID, env.STRIPE_STANDARD_PRICE_ID) : 'free' };
}
