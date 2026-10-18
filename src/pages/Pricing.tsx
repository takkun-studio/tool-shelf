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
      <h1>計算ツールの料金</h1>
      <span>通常版の計算は、プランに関係なくすべて無料です。</span>
    </div>

    <div className="ledger-price-fact">
      <span aria-hidden="true">✓</span>
      <div><strong>通常版は、登録も支払いも不要。</strong>
      <p>すべてのツールで通常計算とCSV出力が無料。月額プランでは条件を変えた2案を並べて比べるPRO比較が使えます。</p></div>
    </div>

    <div className="ledger-prices" aria-label="棚のプラン">
      <article className="ledger-price-option">
        <div className="ledger-price-name"><span>無料</span><strong>Free</strong></div>
        <div className="ledger-price-value"><strong>¥0</strong><small>ずっと無料</small></div>
        <div className="ledger-price-features"><strong>通常版は全ツール無料</strong><p>無料登録でお気に入り3件、試算の保存・再利用もできます。</p></div>
        <Link to={isSignedIn ? '/' : '/login'} className="ledger-price-action ledger-price-action--light">{isSignedIn ? '自分の棚を開く' : '無料で棚を作る'} ↗</Link>
      </article>
      <article className="ledger-price-option">
        <div className="ledger-price-name"><span>使いたいPROを選ぶ</span><strong>選べるPRO</strong></div>
        <div className="ledger-price-value"><strong>¥480</strong><small>/ 月</small></div>
        <div className="ledger-price-features"><strong>好きな5ツールのPRO版</strong><p>全ツールの通常版に加え、選んだ5件でPRO比較が使えます。入れ替え可能。選択内容はアカウントに保存。</p></div>
        <button type="button" className="ledger-price-action" onClick={() => { void checkout('basic'); }}>月480円で5件選ぶ ↗</button>
      </article>
      <article className="ledger-price-option">
        <div className="ledger-price-name"><span>全部のPROを使う</span><strong>全部PRO</strong></div>
        <div className="ledger-price-value"><strong>¥980</strong><small>/ 月</small></div>
        <div className="ledger-price-features"><strong>全ツールのPRO版</strong><p>追加されるツールも含めて、全ツールでPRO比較が使えます。選択や入れ替えは不要。</p></div>
        <button type="button" className="ledger-price-action" onClick={() => { void checkout('standard'); }}>月980円で全部使う ↗</button>
      </article>
    </div>
    <div className="ledger-price-terms">
      <p>※ 全ツールの通常計算・CSV出力は無料。PRO版として提供中の追加機能は「2案の比較」です。今後のPRO機能は実装後に案内します。</p>
      <p>※ 月480円のPRO対象5件はクラウド保存され別端末でも反映されます。無料のお気に入りと通常の試算保存は現在のブラウザ内のみです。</p>
    </div>
  </div>;
}
