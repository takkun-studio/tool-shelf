import { authenticatedPlan, authenticatedUserId, cors, isAllowedOrigin, json, type Env } from './auth';
import { billingStatus, checkoutForUser, handleWebhook, isBillablePlan, portalForUser } from './billing';
import { calculatePaid, isPaidToolId, readPaidInputs } from './calculators';
import { canUsePro, proState, saveBasicSelection } from './pro';

const billingError = (error: unknown, headers: HeadersInit) =>
  error instanceof Error && error.message === 'active_subscription'
    ? json({ error: '契約管理からプランを変更してください' }, 409, headers)
    : error instanceof Error && error.message === 'customer_not_found'
      ? json({ error: '契約情報がありません' }, 404, headers)
      : json({ error: '課金処理を開始できませんでした' }, 502, headers);

export default { async fetch(request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === '/v1/stripe/webhook') {
    const result = await handleWebhook(request, env);
    return json(result.body, result.status);
  }

  const origin = request.headers.get('origin');
  if (!isAllowedOrigin(origin, env)) return json({ error: '許可されていないoriginです' }, 403);
  const headers = cors(origin!);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  if (url.pathname === '/v1/billing/checkout' && request.method === 'POST') {
    const userId = await authenticatedUserId(request, env, origin!);
    if (!userId) return json({ error: 'ログインが必要です' }, 401, headers);
    const body = await request.json().catch(() => null) as { plan?: unknown } | null;
    if (!isBillablePlan(body?.plan)) return json({ error: '月480円または月980円のプランを選択してください' }, 400, headers);
    try {
      const session = await checkoutForUser(env, userId, body.plan, origin!);
      return json({ url: session.url }, 200, headers);
    } catch (error) { return billingError(error, headers); }
  }

  if (url.pathname === '/v1/billing/portal' && request.method === 'POST') {
    const userId = await authenticatedUserId(request, env, origin!);
    if (!userId) return json({ error: 'ログインが必要です' }, 401, headers);
    try {
      const session = await portalForUser(env, userId, origin!);
      return json({ url: session.url }, 200, headers);
    } catch (error) { return billingError(error, headers); }
  }

  if (url.pathname === '/v1/billing/status' && request.method === 'GET') {
    const userId = await authenticatedUserId(request, env, origin!);
    if (!userId) return json({ error: 'ログインが必要です' }, 401, headers);
    return json(await billingStatus(env, userId), 200, headers);
  }

  if (url.pathname === '/v1/pro/status' && request.method === 'GET') {
    const auth = await authenticatedPlan(request, env, origin!);
    if (!auth) return json({ error: 'ログインが必要です' }, 401, headers);
    return json({ plan: auth.plan, ...(await proState(env, auth.userId, auth.plan)) }, 200, headers);
  }

  if (url.pathname === '/v1/pro/selection' && request.method === 'POST') {
    const auth = await authenticatedPlan(request, env, origin!);
    if (!auth) return json({ error: 'ログインが必要です' }, 401, headers);
    const result = await saveBasicSelection(env, auth.userId, auth.plan, await request.json().catch(() => null));
    return json(result.body, result.status, headers);
  }

  const match = url.pathname.match(/^\/v1\/calculators\/([^/]+)$/);
  if (!match || !isPaidToolId(match[1])) return json({ error: 'Not found' }, 404, headers);
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);

  const auth = await authenticatedPlan(request, env, origin!);
  if (!auth) return json({ error: 'ログインが必要です' }, 401, headers);
  if (!(await canUsePro(env, auth.userId, auth.plan, match[1]))) {
    return json({ error: 'このツールは現在のPRO対象に含まれていません' }, 403, headers);
  }

  const inputs = readPaidInputs(match[1], await request.json().catch(() => null));
  if (!inputs) return json({ error: '入力値が不正です' }, 400, headers);
  return json(calculatePaid(match[1], inputs), 200, headers);
} } satisfies ExportedHandler<Env>;
