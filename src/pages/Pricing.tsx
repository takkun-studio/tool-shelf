import { useAuth } from '@clerk/react';
import { Link, useNavigate } from 'react-router-dom';

const workerUrl = import.meta.env.VITE_WORKER_API_URL;

export function Pricing() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  const checkout = async (plan: 'basic' | 'standard') => {
    if (!isLoaded || !isSignedIn) { navigate('/login'); return; }
    if (!workerUrl) return;
    const token = await getToken();
    const response = await fetch(workerUrl + '/v1/billing/checkout', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'content-type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const body = await response.json().catch(() => null) as { url?: unknown } | null;
    if (response.ok && typeof body?.url === 'string') window.location.assign(body.url);
  };

  return <section className="pricing shelf-pricing">
    <p className="shelf-quiet-label">ツール棚の料金</p>
    <h1>通常版はすべて無料。<br/>PRO版だけ選ぶ。</h1>
    <p>全10ツールの通常版とCSV出力は、登録や支払いなしで使えます。PRO版が必要な人だけ、5件か全件かを選べます。</p>

    <div className="shelf-pricing-basics">
      <h2>無料でできること</h2>
      <p>全10ツールの通常計算とCSV出力。無料登録すると、よく使うツールを3件まで棚に置き、試算をこのブラウザに保存できます。</p>
    </div>

    <dl>
      <div>
        <dt>無料</dt>
        <dd>¥0</dd>
        <small>全ツールの通常版・CSV出力。無料登録で棚3枠。</small>
        <Link className="shelf-pricing-link" to={isSignedIn ? '/' : '/login'}>{isSignedIn ? '自分の棚に戻る' : '無料登録して棚を使う'} →</Link>
      </div>
      <div>
        <dt>5件PRO</dt>
        <dd>¥480 <span>/月</span></dd>
        <small>全ツールの通常版に加えて、棚に入れた5件だけPRO対象。対象は入れ替えできます。</small>
        <button onClick={() => { void checkout('basic'); }}>月480円で使う</button>
      </div>
      <div>
        <dt>全件PRO</dt>
        <dd>¥980 <span>/月</span></dd>
        <small>全ツールがPRO対象。個別に選ぶ必要はありません。棚は10件まで使えます。</small>
        <button onClick={() => { void checkout('standard'); }}>月980円で使う</button>
      </div>
    </dl>

    <p className="shelf-pricing-note">月480円のPRO対象5件はアカウントに保存されます。通常版の計算機能は契約なしでも制限されません。</p>
  </section>;
}
