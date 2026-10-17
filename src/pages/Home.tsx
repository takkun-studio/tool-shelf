import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { tools, type Tool, type ToolId } from '../lib/tools';

type AccessFilter = 'all' | 'free' | 'paid';

const symbols: Record<ToolId, ReactNode> = {
  profit: <><rect x="4" y="12" width="16" height="8" rx="2" /><path d="M7 12V8h10v4M8 16h8M12 5v3" /></>,
  breakeven: <><path d="M4 20V4M4 20h16M7 16l4-5 3 2 5-7" /><path d="M15 6h4v4" /></>,
  market: <><path d="M3 10h18l-2-6H5l-2 6ZM5 10v10h14V10M9 20v-7h6v7" /><path d="M3 10c1 3 4 3 6 0 2 3 4 3 6 0 2 3 5 3 6 0" /></>,
  discount: <><circle cx="8" cy="8" r="2" /><circle cx="16" cy="16" r="2" /><path d="M5 19 19 5" /></>,
  payout: <><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18M8 15h4M16 3v3" /></>,
  service: <><path d="M7 3h10l3 3v15H4V3h3ZM8 10h8M8 14h8M8 18h5" /><path d="M14 3v4h6" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /><path d="m12 12 8-8" /></>,
  inventory: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9" /></>,
  channel: <><rect x="3" y="4" width="7" height="7" rx="1" /><rect x="14" y="13" width="7" height="7" rx="1" /><path d="M14 7h5v5M10 17H5v-5M19 7l-9 10" /></>,
  investment: <><path d="M4 20V4M4 20h16M7 16l4-5 3 2 5-7" /><path d="M15 6h4v4M7 8h3" /></>,
};

function ToolIcon({ id }: { id: ToolId }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{symbols[id]}</svg>;
}

function ToolCard({ tool }: { tool: Tool }) {
  const level = tool.access === 'free' ? '無料' : tool.minimumPlan === 'basic' ? 'Basic' : 'Standard';
  return <Link className="shelf-card" to={tool.route} aria-label={`${tool.name}、${level}ツールを開く`}>
    <span className="shelf-card-top"><span className={`shelf-icon shelf-icon-${tool.id}`}><ToolIcon id={tool.id}/></span><span className={`shelf-tag ${tool.access === 'free' ? 'is-free' : 'is-paid'}`}>{level}</span></span>
    <span className="shelf-card-copy"><span className="shelf-card-category">{tool.category}</span><strong>{tool.name}</strong><span>{tool.shortDescription}</span></span>
    <span className="shelf-card-bottom"><span>ツールを開く</span><span aria-hidden="true" className="shelf-arrow">↗</span></span>
  </Link>;
}

export function Home() {
  const [query, setQuery] = useState('');
  const [access, setAccess] = useState<AccessFilter>('all');
  const [category, setCategory] = useState('すべて');
  const categories = useMemo(() => ['すべて', ...new Set(tools.map((tool) => tool.category))], []);
  const filtered = useMemo(() => tools.filter((tool) =>
    (access === 'all' || tool.access === access) &&
    (category === 'すべて' || tool.category === category) &&
    `${tool.name} ${tool.shortDescription} ${tool.category}`.toLocaleLowerCase('ja-JP').includes(query.trim().toLocaleLowerCase('ja-JP'))
  ).sort((a, b) => a.order - b.order), [access, category, query]);
  return <>
    <section className="shelf-hero">
      <div className="shelf-hero-copy">
        <span className="shelf-eyebrow"><span className="shelf-spark" aria-hidden="true"/> 小さな商売の、頼れる道具箱</span>
        <h1>数字の悩みを、<br/><span>もっとシンプルに。</span></h1>
        <p>値付け、利益、出店コスト、売上目標。<br/>個人販売と小さなお店のための計算ツールを、ひとつに。</p>
        <div className="shelf-hero-actions"><a className="shelf-cta" href="#tool-catalog">ツールを探す <span aria-hidden="true">→</span></a><Link className="shelf-plain-link" to="/pricing">料金プランを見る <span aria-hidden="true">↗</span></Link></div>
        <div className="shelf-hero-stats"><span><strong>10</strong> 種類の実用ツール</span><span className="shelf-stat-divider" aria-hidden="true"/><span><strong>3</strong> ツールを無料で</span></div>
      </div>
      <div className="shelf-preview" aria-hidden="true">
        <div className="shelf-preview-top"><span className="shelf-preview-dots"><i/><i/><i/></span><span>TOOL SHELF / OVERVIEW</span></div>
        <div className="shelf-preview-inner"><span className="shelf-preview-kicker">さっと選んで、すぐ計算。</span><div className="shelf-preview-heading">必要な数字が、<br/>ひと目でわかる。</div><div className="shelf-preview-tiles"><div><span>01</span><b>原価・利益</b><i className="shelf-tile-line"/></div><div><span>02</span><b>損益分岐点</b><i className="shelf-tile-bars"><i/><i/><i/><i/></i></div><div><span>03</span><b>出店収支</b><i className="shelf-tile-ring"/></div></div></div>
        <div className="shelf-preview-footer"><span className="shelf-preview-ok"/> 計算から保存まで、ひとつの画面で</div>
      </div>
    </section>

    <section id="tool-catalog" className="shelf-catalog" aria-labelledby="catalog-title">
      <div className="shelf-section-heading"><div><span className="shelf-section-kicker">EXPLORE THE TOOLS</span><h2 id="catalog-title">目的に合うツールを探す</h2><p>まずは無料ツールから。必要に応じて、さらに便利な計算も。</p></div><span className="shelf-results-count">{filtered.length} / {tools.length} ツール</span></div>
      <div className="shelf-toolbar">
        <label className="shelf-search"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ツール名や用途で検索" aria-label="ツールを検索" /></label>
        <div className="shelf-filter-tabs" role="group" aria-label="利用区分で絞り込む">
          {([['all', 'すべて'], ['free', '無料'], ['paid', '有料']] as const).map(([id, name]) => <button key={id} type="button" aria-pressed={access === id} className={access === id ? 'selected' : ''} onClick={() => setAccess(id)}>{name}</button>)}
        </div>
      </div>
      <div className="shelf-categories" role="group" aria-label="カテゴリで絞り込む">{categories.map((item) => <button key={item} type="button" className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {filtered.length ? <div className="shelf-grid">{filtered.map((tool) => <ToolCard key={tool.id} tool={tool}/>)}</div> : <div className="shelf-no-results" role="status"><strong>該当するツールがありません</strong><p>検索語や絞り込みを変えてみてください。</p><button type="button" onClick={() => { setQuery(''); setAccess('all'); setCategory('すべて'); }}>絞り込みを解除する</button></div>}
    </section>
    <section className="shelf-bottom-banner"><div><span>START SIMPLE</span><h2>はじめは無料の3ツールから。</h2><p>原価・利益、損益分岐点、マルシェ出店収支を試せます。</p></div><button type="button" onClick={() => { setQuery(''); setCategory('すべて'); setAccess('free'); document.getElementById('tool-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}>無料ツールを見る <span aria-hidden="true">→</span></button></section>
  </>;
}
