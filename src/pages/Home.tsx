import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShelf } from '../hooks/useShelf';
import { tools, toolById, type Tool, type ToolId } from '../lib/tools';

const featured: { id: ToolId; question: string; note: string }[] = [
  { id: 'profit', question: 'この価格で、利益は残る？', note: '原価・利益計算' },
  { id: 'breakeven', question: '何個売れば、黒字になる？', note: '損益分岐点計算' },
  { id: 'market', question: '出店費用、回収できる？', note: 'マルシェ出店収支計算' },
];

function ToolGlyph({ id }: { id: ToolId }) {
  const kinds: Record<ToolId, 'graph' | 'grid' | 'circle' | 'steps' | 'balance'> = {
    profit: 'graph', breakeven: 'steps', market: 'grid', discount: 'circle',
    payout: 'balance', service: 'steps', target: 'circle', inventory: 'grid',
    channel: 'balance', investment: 'graph',
  };
  const shapes = {
    graph: <><path d="M5 23h30M7 19l8-8 6 5 10-12"/><path d="M25 4h6v6"/></>,
    grid: <><rect x="6" y="6" width="11" height="11" rx="1"/><rect x="21" y="6" width="11" height="11" rx="1"/><rect x="6" y="21" width="11" height="11" rx="1"/><rect x="21" y="21" width="11" height="11" rx="1"/></>,
    circle: <><circle cx="19" cy="19" r="14"/><path d="M19 5v28M5 19h28"/></>,
    steps: <><path d="M4 32h10V22h10V12h10"/><path d="M29 12h5v5"/></>,
    balance: <><path d="M19 5v28M7 12h24M9 12l-5 10h10L9 12ZM29 12l-5 10h10l-5-10ZM12 33h14"/></>,
  };
  return <svg viewBox="0 0 38 38" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">{shapes[kinds[id]]}</svg>;
}

function ToolCard({ tool, isPinned, onToggle, isSignedIn }: {
  tool: Tool; isPinned: boolean; onToggle: (id: ToolId) => void; isSignedIn: boolean;
}) {
  return <li className="shelf-tool-row studio-tile">
    <div className="studio-tile-top">
      <span className="studio-tile-number">{String(tool.order).padStart(2, '0')} <span>/ 10</span></span>
      <div className={`studio-glyph studio-glyph--${tool.category}`}><ToolGlyph id={tool.id}/></div>
    </div>
    <div className="studio-tile-body">
      <span className="studio-tile-category">{tool.category}の計算</span>
      <h3><Link to={tool.route}>{tool.name}</Link></h3>
      <p>{tool.shortDescription}</p>
    </div>
    <div className="studio-tile-bottom">
      <Link className="studio-tile-open" to={tool.route}>計算をはじめる <span aria-hidden="true">↗</span></Link>
      {isSignedIn && <button className="studio-tile-pin" type="button"
        onClick={() => onToggle(tool.id)} aria-pressed={isPinned}
        aria-label={`${tool.name}を${isPinned ? '棚から外す' : '棚に登録する'}`}>
        {isPinned ? '✓ 登録済み' : '＋ 棚に登録'}
      </button>}
    </div>
  </li>;
}

export function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('すべて');
  const shelf = useShelf();
  const categories = useMemo(() => ['すべて', ...new Set(tools.map((tool) => tool.category))], []);
  const filtered = useMemo(() => tools.filter((tool) =>
    (category === 'すべて' || tool.category === category) &&
    `${tool.name} ${tool.shortDescription} ${tool.category}`.toLocaleLowerCase('ja-JP').includes(query.trim().toLocaleLowerCase('ja-JP'))
  ).sort((a, b) => a.order - b.order), [category, query]);

  return <>
    <section className="studio-hero" aria-labelledby="studio-hero-title">
      <div className="studio-hero-copy">
        <span className="studio-hero-eyebrow"><span aria-hidden="true" className="studio-hero-dot"/> 小さなお店と、個人販売のために。</span>
        <h1 id="studio-hero-title">商売の数字を、<br/><span>もっと身近に。</span></h1>
        <p>原価も、値引きも、出店費用も。<br/>迷ったときにすぐ開ける、10種類の計算道具。</p>
        <div className="studio-hero-actions">
          <a href="#tool-catalog" className="studio-primary-link">ツールを探す <span aria-hidden="true">↘</span></a>
          <span className="studio-no-login">全10種類、登録なしで無料</span>
        </div>
        <span className="studio-hero-index">TOOL SHELF <span>/</span> 2026</span>
      </div>
      <div className="studio-hero-shortcuts">
        <div className="studio-shortcuts-top"><span>まずは、この計算から</span><span>01 — 03</span></div>
        {featured.map(({ id, question, note }, index) =>
          <Link className="studio-shortcut" to={toolById(id).route} key={id}>
            <span className="studio-shortcut-no">0{index + 1}</span>
            <span className="studio-shortcut-text"><strong>{question}</strong><small>{note}</small></span>
            <span className="studio-shortcut-arrow" aria-hidden="true">↗</span>
          </Link>
        )}
        <div className="studio-shortcuts-bottom">どれも、会員登録せずに使えます <span aria-hidden="true">✓</span></div>
      </div>
    </section>

    <section className="studio-shelf" aria-labelledby="studio-shelf-title">
      <div className="studio-shelf-heading">
        <div><span className="studio-overline">YOUR WORKSPACE</span><h2 id="studio-shelf-title">自分の棚 <span className="studio-heading-dot">.</span></h2></div>
        <span className="studio-shelf-plan">{shelf.isSignedIn ? `${shelf.pins.length} / ${shelf.limit} 枠` : '無料登録で 3 枠'}</span>
      </div>
      {!shelf.isLoaded ? <p className="studio-shelf-loading">ログイン状態を確認しています。</p>
        : !shelf.isSignedIn ?
          <div className="studio-shelf-guest">
            <div className="studio-shelf-guest-image" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div>
            <div className="studio-shelf-guest-text">
              <strong>よく使う道具を、いつもの場所へ。</strong>
              <p>お気に入りのツールを並べておけば、次からすぐ使えます。計算は登録前でも無料。</p>
            </div>
            <Link to="/login" className="studio-shelf-signup">無料で棚をつくる <span aria-hidden="true">→</span></Link>
          </div> :
          <div className="studio-shelf-member">
            {shelf.pins.length === 0 ? <div className="studio-shelf-empty">
              <span className="studio-shelf-empty-sign">＋</span>
              <div><strong>ここに、いつもの道具を。</strong><p>下のツール一覧から「棚に登録」を選んでください。</p></div>
            </div> :
              <ol className="studio-pins">{shelf.pins.map((id, index) => {
                const tool = toolById(id);
                return <li key={id}>
                  <span className="studio-pin-num">{String(index + 1).padStart(2, '0')}</span>
                  <Link to={tool.route}>{tool.name}<span aria-hidden="true"> ↗</span></Link>
                  <div className="studio-pin-actions">
                    <button type="button" disabled={index === 0} onClick={() => shelf.move(id, -1)} aria-label={`${tool.name}を上へ`}>↑</button>
                    <button type="button" disabled={index === shelf.pins.length - 1} onClick={() => shelf.move(id, 1)} aria-label={`${tool.name}を下へ`}>↓</button>
                    <button type="button" onClick={() => shelf.toggle(id)} aria-label={`${tool.name}を外す`}>外す</button>
                  </div>
                </li>;
              })}</ol>}
            {shelf.message && <p role="status" className="studio-shelf-note">{shelf.message}</p>}
            {shelf.hiddenCount > 0 && <p className="studio-shelf-note">プラン枠を超える登録は保持されています。</p>}
            <p className="studio-shelf-note">並び順はこのブラウザに保存されます。<Link to="/pricing">棚の枠を増やす →</Link></p>
          </div>}
    </section>

    <section id="tool-catalog" className="studio-catalog" aria-labelledby="studio-catalog-title">
      <header className="studio-catalog-heading">
        <div><span className="studio-overline">10 TOOLS, ALL FREE</span><h2 id="studio-catalog-title">道具をえらぶ<span className="studio-heading-dot">.</span></h2></div>
        <p>販売から在庫管理まで。<br/>必要な計算を、すぐに。</p>
      </header>
      <div className="studio-directory">
        <aside className="studio-sidebar" aria-label="ツールを絞り込む">
          <label className="studio-search-label" htmlFor="tool-query">道具を検索</label>
          <div className="studio-search-wrap"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/></svg><input id="tool-query" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="名前・用途で探す"/></div>
          <p className="studio-sidebar-title">カテゴリから探す</p>
          <div className="studio-categories" role="group" aria-label="カテゴリ">
            {categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={category === item ? 'selected' : ''}>
              <span>{item}</span><span>{item === 'すべて' ? String(tools.length).padStart(2, '0') : String(tools.filter(tool => tool.category === item).length).padStart(2, '0')}</span>
            </button>)}
          </div>
          <div className="studio-sidebar-note"><span>使い方のヒント</span><p>10種類の計算はすべて無料。有料プランは、よく使う道具を並べる棚の拡張に使います。</p><Link to="/pricing">棚のプランを見る ↗</Link></div>
        </aside>
        <div className="studio-directory-content">
          <div className="studio-directory-status"><span>ツール一覧 <strong>{filtered.length}</strong> 件</span><span>すべて無料</span></div>
          {filtered.length ?
            <ol className="shelf-tool-list studio-grid">{filtered.map(tool =>
              <ToolCard tool={tool} key={tool.id} isPinned={shelf.pins.includes(tool.id)} onToggle={shelf.toggle} isSignedIn={shelf.isSignedIn}/>)}</ol> :
            <div className="studio-no-results"><strong>見つかりませんでした。</strong><p>別のキーワードで探すか、絞り込みを解除してください。</p><button type="button" onClick={() => { setQuery(''); setCategory('すべて'); }}>すべて表示</button></div>}
        </div>
      </div>
    </section>
    <section className="studio-outro">
      <div><span>FREE TO USE</span><h2>計算は無料。<br/>使いやすさは、自分次第。</h2></div>
      <div><p>どのツールも登録せずに使えます。道具を並べ替えて自分仕様にしたい方には、無料の棚から。</p><Link to={shelf.isSignedIn ? '/pricing' : '/login'}>{shelf.isSignedIn ? '棚の登録枠を見る' : '無料で棚をつくる'} <span aria-hidden="true">→</span></Link></div>
    </section>
  </>;
}
