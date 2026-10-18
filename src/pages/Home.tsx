import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShelf } from '../hooks/useShelf';
import { calculate } from '../lib/calculators';
import { tools, toolById, type Tool, type ToolId } from '../lib/tools';

const sections = [
  { name:'販売', detail:'価格を決める・利益を出す', sign:'売' },
  { name:'出店', detail:'イベント・出店費を計算', sign:'店' },
  { name:'サービス', detail:'作業時間から料金を決める', sign:'役' },
  { name:'在庫', detail:'仕入れと在庫を調べる', sign:'庫' },
  { name:'事業', detail:'投資の回収を考える', sign:'計' },
];

function useMiniProfit() {
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [shipping, setShipping] = useState('');
  const allFilled = [price, cost, shipping].every(value => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)));
  const result = allFilled ? calculate('profit', {
    price:Number(price),cost:Number(cost),shipping:Number(shipping),
    feeRate:0,fixedFee:0,other:0,
  }).rows.find(row => row.key === 'profit')?.value : null;
  return { price, setPrice, cost, setCost, shipping, setShipping, result };
}

function MiniCalculator() {
  const calc = useMiniProfit();
  return <section className="handy-mini" aria-labelledby="handy-mini-title">
    <header className="handy-mini-bar"><span className="handy-mini-led" aria-hidden="true"/> <h2 id="handy-mini-title">利益をちょっと計算</h2><small>おためし計算</small></header>
    <div className="handy-mini-inner">
      <div className="handy-mini-inputs">
        <label>販売価格 <span>円</span><input type="number" min="0" step="1" inputMode="numeric" value={calc.price} onChange={e => calc.setPrice(e.target.value)} placeholder="例：3000"/></label>
        <label>仕入れ・原価 <span>円</span><input type="number" min="0" step="1" inputMode="numeric" value={calc.cost} onChange={e => calc.setCost(e.target.value)} placeholder="例：1200"/></label>
        <label>送料 <span>円</span><input type="number" min="0" step="1" inputMode="numeric" value={calc.shipping} onChange={e => calc.setShipping(e.target.value)} placeholder="例：300"/></label>
      </div>
      <div className="handy-mini-total" aria-live="polite">
        <span>手元に残る額（概算）</span>
        <strong>{calc.result == null ? '—' : calc.result.toLocaleString('ja-JP')}<small> 円</small></strong>
        <small>※ 手数料・その他の経費は含みません</small>
      </div>
    </div>
    <Link to="/tools/profit" className="handy-mini-more">手数料も入れて詳しく計算 <span aria-hidden="true">↗</span></Link>
  </section>;
}

function ToolItem({ tool, pinned, proEnabled, plan, onToggle, signedIn, busy }: {
  tool: Tool;
  pinned: boolean;
  proEnabled: boolean;
  plan: 'free' | 'basic' | 'standard';
  onToggle: (id: ToolId) => void;
  signedIn: boolean;
  busy: boolean;
}) {
  const buttonText = plan === 'basic'
    ? pinned ? '★ PRO対象' : '☆ PROに追加'
    : pinned ? '★ 登録中' : '☆ 棚に入れる';

  return <li className="handy-tool">
    <div className="handy-tool-content">
      <Link to={tool.route} className="handy-tool-link"><span className="handy-tool-title">{tool.name}</span><span className="handy-tool-arrow" aria-hidden="true">↗</span></Link>
      <p>{tool.shortDescription}</p>
      {proEnabled && <span className="handy-tool-pro">PRO対象</span>}
    </div>
    {signedIn && <button type="button" disabled={busy} onClick={() => onToggle(tool.id)} className="handy-tool-save" aria-pressed={pinned}
      aria-label={tool.name + 'を' + (pinned ? '棚から外す' : '棚に登録する')}>
      {buttonText}
    </button>}
  </li>;
}

export function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('すべて');
  const shelf = useShelf();
  const filtered = useMemo(() => tools.filter(tool =>
    (category === 'すべて' || tool.category === category) &&
    [tool.name, tool.shortDescription, tool.category].join(' ').toLocaleLowerCase('ja-JP').includes(query.trim().toLocaleLowerCase('ja-JP'))
  ).sort((a, b) => a.order - b.order), [category, query]);
  const categories = ['すべて', ...sections.map(item => item.name)];

  return <div className="handy">
    <div className="handy-heading">
      <div className="handy-heading-label">個人販売のための、10の計算道具。</div>
      <h1>ツール棚 <span>／ 道具一覧</span></h1>
      <p>値付け、出店、在庫。数字が必要になったら、ここから。</p>
    </div>

    <div className="handy-top-grid">
      <section className="handy-my-shelf" aria-labelledby="handy-shelf-heading">
        <div className="handy-my-shelf-head">
          <h2 id="handy-shelf-heading">{shelf.plan === 'basic' ? 'PROにする5件' : '自分の棚'}</h2>
          <span>{shelf.isSignedIn
            ? shelf.plan === 'standard' ? shelf.pins.length + ' / ' + shelf.limit + ' 個・全PRO'
              : shelf.pins.length + ' / ' + shelf.limit + ' 個'
            : '無料登録で3個まで'}</span>
        </div>

        {!shelf.isLoaded ? <p className="handy-shelf-help">契約状態を確認しています。</p>
          : shelf.isSignedIn ? <>
            {shelf.pins.length ? <ol className="handy-shelf-pins">{shelf.pins.map((id,index) =>
              <li key={id}><Link to={toolById(id).route}><span>{String(index + 1).padStart(2,'0')}</span>{toolById(id).name}</Link>
              <div><button type="button" onClick={() => shelf.move(id,-1)} disabled={shelf.busy || !index} aria-label={toolById(id).name + 'を上に移動'}>↑</button>
              <button type="button" onClick={() => shelf.move(id,1)} disabled={shelf.busy || index === shelf.pins.length-1} aria-label={toolById(id).name + 'を下に移動'}>↓</button>
              <button type="button" onClick={() => shelf.toggle(id)} disabled={shelf.busy} aria-label={toolById(id).name + 'を棚から外す'}>×</button></div></li>)}</ol> :
              <div className="handy-shelf-blank"><span aria-hidden="true">＋</span><p>{shelf.plan === 'basic'
                ? '下の一覧からPRO版を使いたいツールを5件まで選べます。'
                : shelf.plan === 'standard'
                  ? '全ツールPRO対象です。よく使う10件を棚に置けます。'
                  : 'よく使う道具は、下の一覧から登録できます。'}</p></div>}

            {shelf.plan === 'basic' && shelf.replaceCandidate && <div className="handy-shelf-swap">
              <strong>「{toolById(shelf.replaceCandidate).name}」と入れ替えるツールを選択</strong>
              {shelf.pins.map(id => <button type="button" key={id} disabled={shelf.busy} onClick={() => shelf.replace(id)}>
                {toolById(id).name} と入れ替える
              </button>)}
              <button type="button" disabled={shelf.busy} onClick={shelf.cancelReplace}>キャンセル</button>
            </div>}

            {shelf.message && <p className="handy-shelf-notice" role="status">{shelf.message}</p>}
            {shelf.hiddenCount > 0 && <p className="handy-shelf-notice">登録枠を超えた分も保存されています。</p>}
            <Link to="/pricing" className="handy-shelf-plan">{shelf.plan === 'basic'
              ? '全ツールPROのプランを見る →'
              : shelf.plan === 'standard' ? '全ツールPRO利用中・料金を確認 →' : 'PRO版の料金を見る →'}</Link>
          </> :
          <div className="handy-shelf-guest">
            <div className="handy-shelf-art" aria-hidden="true"><i>01</i><i>02</i><i>03</i></div>
            <p>通常版は登録なしで使えます。<br/>無料登録すると、よく使う3件を棚に置けます。</p>
            <Link to="/login">無料で自分の棚をつくる →</Link>
          </div>}
      </section>
      <MiniCalculator/>
    </div>

    <section id="tool-catalog" className="handy-directory" aria-labelledby="handy-directory-title">
      <div className="handy-directory-title"><div><span>道具を探す</span><h2 id="handy-directory-title">すべての計算ツール</h2></div><p>通常版は全10種類無料</p></div>
      <div className="handy-filter-bar">
        <label className="handy-search" htmlFor="tool-query"><span aria-hidden="true">⌕</span><span className="handy-sr-only">ツールを検索</span>
          <input id="tool-query" value={query} onChange={e => setQuery(e.target.value)} type="search" placeholder="道具の名前、計算したいことから探す" />
        </label>
        <div className="handy-filters" role="group" aria-label="種類を絞り込む">{categories.map(item =>
          <button key={item} type="button" aria-pressed={category === item} className={category===item?'selected':''}
            onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      <div className="handy-directory-grid">
        {sections.map((section,index)=>{
          const list = filtered.filter(tool=>tool.category===section.name);
          if (!list.length) return null;
          return <section key={section.name} className={'handy-group handy-group--' + index} aria-labelledby={'handy-group-' + index}>
            <div className="handy-group-head"><div className="handy-group-seal" aria-hidden="true">{section.sign}</div><div><h3 id={'handy-group-' + index}>{section.name}</h3><p>{section.detail}</p></div><span>{list.length}件</span></div>
            <ul>{list.map(tool => <ToolItem key={tool.id} tool={tool}
              pinned={shelf.pins.includes(tool.id)}
              proEnabled={shelf.canUsePro(tool.id)}
              plan={shelf.plan}
              signedIn={shelf.isSignedIn}
              busy={shelf.busy}
              onToggle={shelf.toggle}/>)}</ul>
          </section>;
        })}
        {!filtered.length && <div className="handy-no-results"><strong>見つかりませんでした。</strong><p>別の言葉で試してください。</p><button type="button" onClick={() => { setCategory('すべて');setQuery(''); }}>すべて表示する</button></div>}
      </div>
    </section>
    <div className="handy-bottom-note"><p>通常版は無料。月480円は選んだ5件、月980円は全ツールがPRO対象。</p><Link to="/pricing">料金を見る →</Link></div>
  </div>;
}
