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

  return <div className="ledger-price-page">
    <Link to="/" className="ledger-price-back">← 計算ツールに戻る</Link>
    <div className="ledger-price-heading">
      <p>ツール棚 / 料金</p>
      <h1>通常版は無料。<br/>PROだけ選ぶ。</h1>
      <span>無料版を狭くして課金するのではなく、必要な人だけPRO版を追加します。</span>
    </div>

    <div className="ledger-price-fact">
      <span aria-hidden="true">✓</span>
      <div><strong>全ツールの通常版とCSV出力は無料。</strong>
      <p>月480円は、棚に入れた5件だけPRO対象。月980円は、棚に入れなくても全ツールがPRO対象です。</p></div>
    </div>

    <div className="ledger-prices" aria-label="料金プラン">
      <article className="ledger-price-option">
        <div className="ledger-price-name"><span>通常版</span><strong>無料</strong></div>
        <div className="ledger-price-value"><strong>¥0</strong><small>ずっと無料</small></div>
        <div className="ledger-price-features"><strong>全ツール通常版</strong><p>計算・CSV出力は全種類無料。無料登録すると、よく使う3件を棚に置けます。</p></div>
        <Link to={isSignedIn ? '/' : '/login'} className="ledger-price-action ledger-price-action--light">{isSignedIn ? 'ツール棚を開く' : '無料登録する'} ↗</Link>
      </article>

      <article className="ledger-price-option">
        <div className="ledger-price-name"><span>必要なPROだけ</span><strong>5件PRO</strong></div>
        <div className="ledger-price-value"><strong>¥480</strong><small>/ 月</small></div>
        <div className="ledger-price-features"><strong>棚に入れた5件がPRO対象</strong><p>PRO版を使いたいツールを5件まで選択。別のツールに使いたくなったら入れ替えできます。</p></div>
        <button type="button" className="ledger-price-action" onClick={() => { void checkout('basic'); }}>月480円で使う ↗</button>
      </article>

      <article className="ledger-price-option">
        <div className="ledger-price-name"><span>全部使う</span><strong>全件PRO</strong></div>
        <div className="ledger-price-value"><strong>¥980</strong><small>/ 月</small></div>
        <div className="ledger-price-features"><strong>全ツールがPRO対象</strong><p>個別に選ぶ必要なし。ツールが追加された場合も、そのままPRO対象になります。</p></div>
        <button type="button" className="ledger-price-action" onClick={() => { void checkout('standard'); }}>月980円で使う ↗</button>
      </article>
    </div>

    <div className="ledger-price-terms">
      <p>※ 通常版の計算とCSV出力は、契約の有無に関係なく無料です。</p>
      <p>※ 月480円のPRO対象5件はアカウント単位で保存します。別画面や別端末から同時に変更した場合は古い更新を上書きせず、最新状態を読み直します。</p>
      <p>※ PRO版の具体的な追加機能は、各ツールで実装済みの内容だけを提供します。未実装機能を料金には含めません。</p>
    </div>
  </div>;
}
