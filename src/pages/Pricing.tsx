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

  return <div className="ledger-price-page">
    <Link to="/" className="ledger-price-back">← 計算ツールに戻る</Link>
    <div className="ledger-price-heading">
      <p>ツール棚 / プラン</p>
      <h1>棚の料金</h1>
      <span>10種類の計算は、プランに関係なく無料です。</span>
    </div>

    <div className="ledger-price-fact">
      <span aria-hidden="true">✓</span>
      <div><strong>計算するだけなら、登録も支払いも不要。</strong>
      <p>原価・利益計算から初期投資回収まで、どのツールも無料で使えます。月額プランは、よく使う道具を並べておく「自分の棚」のためのものです。</p></div>
    </div>

    <div className="ledger-prices" aria-label="棚のプラン">
      <article className="ledger-price-option">
        <div className="ledger-price-name"><span>無料</span><strong>Free</strong></div>
        <div className="ledger-price-value"><strong>¥0</strong><small>ずっと無料</small></div>
        <div className="ledger-price-features"><strong>自分の棚 3 枠</strong><p>よく使う道具を固定・並べ替え。試算の保存と読み込みもできます。</p></div>
        <Link to={isSignedIn ? '/' : '/login'} className="ledger-price-action ledger-price-action--light">{isSignedIn ? '自分の棚を開く' : '無料で棚を作る'} ↗</Link>
      </article>
      <article className="ledger-price-option">
        <div className="ledger-price-name"><span>日常的に使う方向け</span><strong>Basic</strong></div>
        <div className="ledger-price-value"><strong>¥480</strong><small>/ 月</small></div>
        <div className="ledger-price-features"><strong>自分の棚 5 枠</strong><p>無料の棚から2枠追加。いつも使う道具をまとめておけます。</p></div>
        <button type="button" className="ledger-price-action" onClick={() => { void checkout('basic'); }}>Basic を契約 ↗</button>
      </article>
      <article className="ledger-price-option">
        <div className="ledger-price-name"><span>全ツールを整理する方向け</span><strong>Standard</strong></div>
        <div className="ledger-price-value"><strong>¥980</strong><small>/ 月</small></div>
        <div className="ledger-price-features"><strong>自分の棚 10 枠</strong><p>10種類すべてを好きな順番で並べて、すぐに開けます。</p></div>
        <button type="button" className="ledger-price-action" onClick={() => { void checkout('standard'); }}>Standard を契約 ↗</button>
      </article>
    </div>
    <div className="ledger-price-terms">
      <p>※ 計算・CSV出力はどのプランでも無料です。課金によって計算結果や使えるツールが変わることはありません。</p>
      <p>※ 棚の並び順と保存済み試算は、このブラウザ内に保存されます。別端末には自動同期されません。</p>
    </div>
  </div>;
}
