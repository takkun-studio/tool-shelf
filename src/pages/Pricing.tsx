import { useAuth } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { accessibleToolCount } from '../lib/access';
const workerUrl = import.meta.env.VITE_WORKER_API_URL;
const count = (plan: 'free' | 'basic' | 'standard') => `${accessibleToolCount(plan)}ツール`;
export function Pricing() {
  const { getToken, isLoaded, isSignedIn } = useAuth(), navigate = useNavigate();
  const checkout = async (plan: 'basic' | 'standard') => {
    if (!isLoaded || !isSignedIn) { navigate('/login'); return; }
    if (!workerUrl) return;
    const token = await getToken();
    const response = await fetch(`${workerUrl}/v1/billing/checkout`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ plan }) });
    const body = await response.json().catch(() => null) as { url?: unknown } | null;
    if (response.ok && typeof body?.url === 'string') window.location.assign(body.url);
  };
  return <section className="pricing"><h1>料金プラン</h1><p>有料ツールは認証済みの対象planで利用できます。</p><dl><div><dt>Free</dt><dd>{count('free')}</dd><small>原価・利益、損益分岐点、マルシェ出店収支</small></div><div><dt>Basic</dt><dd>{count('basic')} / ¥480/月</dd><small>Freeに加え、値引き・セール利益、手取り売上</small><button onClick={() => { void checkout('basic'); }}>Basicを契約</button></div><div><dt>Standard</dt><dd>{count('standard')} / ¥980/月</dd><small>全10ツール</small><button onClick={() => { void checkout('standard'); }}>Standardを契約</button></div></dl></section>;
}
