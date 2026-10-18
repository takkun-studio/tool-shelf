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
    const response = await fetch(`${workerUrl}/v1/billing/checkout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const body = await response.json().catch(() => null) as { url?: unknown } | null;
    if (response.ok && typeof body?.url === 'string') window.location.assign(body.url);
  };
  return <section className="pricing shelf-pricing">
    <p className="shelf-quiet-label">ツール棚の使い方と料金</p>
    <h1>計算はすべて無料。<br/>月額は、使いやすい棚のために。</h1>
    <p>原価計算も、出店収支も、残りの7つも。10種類すべて、登録や支払いなしで使えます。<br/>使う道具をまとめて、好きな順に並べておきたい人向けに棚のプランを用意しています。</p>
    <div className="shelf-pricing-basics">
      <h2>無料でできること</h2>
      <p>全10ツールの単発計算とCSV出力。アカウントを作ると、棚に3ツールまで登録し、入力した試算をこのブラウザに保存できます。</p>
    </div>
    <dl>
      <div><dt>Free</dt><dd>¥0</dd><small>計算ツールは全10種類使えます。無料登録で棚3枠。試算の保存・再利用もできます。</small><Link className="shelf-pricing-link" to={isSignedIn ? '/' : '/login'}>{isSignedIn ? '自分の棚に戻る' : '無料登録して棚を使う'} →</Link></div>
      <div><dt>Basic</dt><dd>¥480 <span>/月</span></dd><small>計算ツールは全10種類使えます。棚5枠。よく使う道具をさらに2個置けます。</small><button onClick={() => { void checkout('basic'); }}>Basicの棚を使う</button></div>
      <div><dt>Standard</dt><dd>¥980 <span>/月</span></dd><small>計算ツールは全10種類使えます。棚10枠。すべての道具を好みの順に並べられます。</small><button onClick={() => { void checkout('standard'); }}>Standardの棚を使う</button></div>
    </dl>
    <p className="shelf-pricing-note">月額契約なしでも計算機能が制限されることはありません。棚の並びと保存済み試算は、このブラウザに保存されます。別端末への自動同期はありません。</p>
  </section>;
}
