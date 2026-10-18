import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShelf } from '../hooks/useShelf';
import { tools, toolById, type Tool, type ToolId } from '../lib/tools';

const sections = [
  { id: '販売', title: '販売の計算', note: '値付け・利益・売上' },
  { id: '出店', title: '出店の計算', note: 'イベント・マルシェ' },
  { id: 'サービス', title: 'サービスの計算', note: '料金・作業時間' },
  { id: '在庫', title: '在庫の計算', note: '仕入れ・在庫回転' },
  { id: '事業', title: '事業の計算', note: '投資・回収' },
] as const;

function CalculatorRow({ tool, pinned, onToggle, signedIn }: {
  tool: Tool;
  pinned: boolean;
  onToggle: (id: ToolId) => void;
  signedIn: boolean;
}) {
  return <li className="ledger-row">
    <span className="ledger-row-number">{String(tool.order).padStart(2, '0')}</span>
    <Link className="ledger-row-link" to={tool.route}>
      <strong>{tool.name}</strong>
      <span>{tool.shortDescription}</span>
    </Link>
    {signedIn && <button type="button" className="ledger-row-pin" aria-pressed={pinned}
      aria-label={`${tool.name}を${pinned ? '棚から外す' : '棚に登録する'}`}
      onClick={() => onToggle(tool.id)}>
      {pinned ? '棚に登録済' : '棚に追加'}
    </button>}
    <Link className="ledger-row-open" to={tool.route} aria-label={`${tool.name}を開く`}>
      <span>開く</span><span aria-hidden="true">↗</span>
    </Link>
  </li>;
}

export function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('すべて');
  const shelf = useShelf();
  const filtered = useMemo(() => tools.filter((tool) =>
    (category === 'すべて' || tool.category === category) &&
    `${tool.name} ${tool.shortDescription} ${tool.category}`.toLocaleLowerCase('ja-JP').includes(query.trim().toLocaleLowerCase('ja-JP'))
  ).sort((a, b) => a.order - b.order), [category, query]);

  return <div className="ledger">
    <div className="ledger-page-heading">
      <div>
        <div className="ledger-heading-marker" aria-hidden="true"><span></span><span></span><span></span></div>
        <p>個人販売・小さなお店のための道具箱</p>
        <h1>計算ツール<span>10</span></h1>
      </div>
      <p className="ledger-heading-note"><span>全種類無料</span> 登録なしで計算できます</p>
    </div>

    <div className="ledger-workspace">
      <aside className="ledger-side">
        <div className="ledger-side-intro"><span>自分の棚</span><span className="ledger-side-index">保存する道具</span></div>
        {!shelf.isLoaded ? <p className="ledger-side-muted">ログイン状態を確認しています。</p>
        : shelf.isSignedIn ? <>
          <p className="ledger-side-counter">登録済み <strong>{shelf.pins.length}</strong><span> / {shelf.limit} 枠</span></p>
          {shelf.pins.length === 0 ? <p className="ledger-side-muted">下の一覧から、よく使う道具を追加できます。</p> :
            <ol className="ledger-pins">{shelf.pins.map((id, index) => {
              const tool = toolById(id);
              return <li key={id}><div className="ledger-pin-name"><span>{String(index + 1).padStart(2, '0')}</span><Link to={tool.route}>{tool.name}</Link></div>
                <div className="ledger-pin-actions">
                  <button type="button" disabled={index === 0} aria-label={`${tool.name}を上へ移動`} onClick={() => shelf.move(id, -1)}>↑</button>
                  <button type="button" disabled={index === shelf.pins.length - 1} aria-label={`${tool.name}を下へ移動`} onClick={() => shelf.move(id, 1)}>↓</button>
                  <button type="button" aria-label={`${tool.name}を外す`} onClick={() => shelf.toggle(id)}>×</button>
                </div>
              </li>;
            })}</ol>}
          {shelf.hiddenCount > 0 && <p className="ledger-side-muted">枠を超える登録は保持されています。</p>}
          {shelf.message && <p className="ledger-side-feedback" role="status">{shelf.message}</p>}
          <p className="ledger-side-muted">このブラウザに保存されます。</p>
          <Link className="ledger-side-plan" to="/pricing">棚の枠を増やす <span aria-hidden="true">↗</span></Link>
        </> :
          <div className="ledger-side-guest">
            <p>よく使う道具を<br/><strong>３つまで固定。</strong></p>
            <span>無料登録で自分の棚が使えます。計算は登録しなくても無料。</span>
            <Link to="/login">無料で棚を作る <span aria-hidden="true">↗</span></Link>
          </div>}
        <div className="ledger-side-nav">
          <h2>用途で探す</h2>
          <div role="group" aria-label="カテゴリで絞り込む">
            <button type="button" className={category === 'すべて' ? 'active' : ''} aria-pressed={category === 'すべて'} onClick={() => setCategory('すべて')}>
              <span>すべて</span><small>{tools.length}</small>
            </button>
            {sections.map(section => <button type="button" key={section.id} className={category === section.id ? 'active' : ''} aria-pressed={category === section.id} onClick={() => setCategory(section.id)}>
              <span>{section.id}</span><small>{tools.filter(tool => tool.category === section.id).length}</small>
            </button>)}
          </div>
        </div>
        <p className="ledger-side-footnote">月額プランは計算の購入ではなく、自分の棚の登録枠を増やすためのものです。</p>
      </aside>

      <section id="tool-catalog" className="ledger-main" aria-labelledby="ledger-catalog-title">
        <div className="ledger-main-header">
          <div><p className="ledger-main-kicker">道具を選ぶ</p><h2 id="ledger-catalog-title">ツール一覧</h2></div>
          <span className="ledger-main-count">{filtered.length} <small>件</small></span>
        </div>
        <label className="ledger-search" htmlFor="tool-query">
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5.5 5.5"/></svg>
          <span className="sr-only">ツールを検索</span>
          <input id="tool-query" type="search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="道具の名前や、計算したいことを入力"/>
          <span className="ledger-search-hint">全10ツールから検索</span>
        </label>

        <div className="ledger-mobile-categories" role="group" aria-label="カテゴリで絞り込む（スマホ）">
          {['すべて', ...sections.map(section => section.id)].map(item => <button type="button" key={item}
            className={category === item ? 'active' : ''} aria-pressed={category === item}
            onClick={() => setCategory(item)}>{item}</button>)}
        </div>

        <div className="ledger-section-list">
          {sections.map((section, index) => {
            const sectionTools = filtered.filter(tool => tool.category === section.id);
            if (sectionTools.length === 0) return null;
            return <section className="ledger-group" key={section.id} aria-labelledby={`ledger-group-${section.id}`}>
              <div className="ledger-group-heading">
                <div className="ledger-group-heading-left"><span>{String(index + 1).padStart(2, '0')}</span><h3 id={`ledger-group-${section.id}`}>{section.title}</h3></div>
                <span className="ledger-group-note">{section.note} <b>{sectionTools.length}件</b></span>
              </div>
              <ol className="ledger-tool-list">{sectionTools.map(tool => <CalculatorRow key={tool.id}
                tool={tool} pinned={shelf.pins.includes(tool.id)} onToggle={shelf.toggle} signedIn={shelf.isSignedIn}/>)}</ol>
            </section>;
          })}
          {!filtered.length && <div className="ledger-no-results"><strong>該当する道具がありません。</strong><p>検索する言葉を変えてみてください。</p>
            <button type="button" onClick={() => { setQuery(''); setCategory('すべて'); }}>すべて表示する</button></div>}
        </div>
      </section>
    </div>
    <footer className="ledger-note"><span>道具箱の中身は、いつでも無料。</span><Link to="/pricing">自分の棚について <span aria-hidden="true">↗</span></Link></footer>
  </div>;
}
