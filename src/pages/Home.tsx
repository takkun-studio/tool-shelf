import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShelf } from '../hooks/useShelf';
import { tools, toolById, type Tool, type ToolId } from '../lib/tools';

function ToolRow({ tool, index, pinned, onToggle, signedIn }: { tool: Tool; index: number; pinned: boolean; onToggle: (id: ToolId) => void; signedIn: boolean }) {
  return <li className="shelf-tool-row">
    <span className="shelf-tool-index">{String(index).padStart(2, '0')}</span>
    <Link to={tool.route} className="shelf-tool-link">
      <span className="shelf-tool-name">{tool.name}<small>{tool.category}</small></span>
      <span className="shelf-tool-detail">{tool.shortDescription}</span>
      <span aria-hidden="true" className="shelf-tool-go">開く →</span>
    </Link>
    {signedIn && <button type="button" className="shelf-tool-pin" aria-label={`${tool.name}を${pinned ? '棚から外す' : '棚に追加する'}`} aria-pressed={pinned} onClick={() => onToggle(tool.id)}>{pinned ? '棚から外す' : '＋ 棚に入れる'}</button>}
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
    <section className="shelf-intro">
      <div className="shelf-intro-primary">
        <p className="shelf-quiet-label">個人販売・小さなお店の計算道具</p>
        <h1>数字を出す。<br/>判断は、自分でする。</h1>
        <p>原価、出店費用、売上目標。必要な計算を、必要なときに。<br/>全10ツール、会員登録なしでも無料で使えます。</p>
        <a className="shelf-intro-link" href="#tool-catalog">計算ツールを見る <span aria-hidden="true">↓</span></a>
      </div>
      <div className="shelf-intro-secondary">
        <p className="shelf-small-heading">自分の棚について</p>
        <h2>使う道具だけ、手元に。</h2>
        <p>無料登録すると、よく使うツールを3つまで並べておけます。月額プランはツールの解放ではなく、棚の拡張に使います。</p>
        <Link to={shelf.isSignedIn ? '/pricing' : '/login'}>{shelf.isSignedIn ? '棚の枠を増やす' : '無料で棚を作る'} <span aria-hidden="true">→</span></Link>
      </div>
    </section>

    <section className="shelf-my-tools" aria-labelledby="my-tools-title">
      <div className="shelf-my-tools-top">
        <h2 id="my-tools-title">自分の棚</h2>
        {shelf.isSignedIn && <span>{shelf.pins.length} / {shelf.limit} 枠</span>}
      </div>
      {!shelf.isLoaded ? <p>ログイン状態を確認しています。</p> : !shelf.isSignedIn ?
        <div className="shelf-empty-state"><p>計算はこのまま無料で使えます。よく使うツールを並べたい方は、無料登録から。</p><Link to="/login">棚を使うために登録する →</Link></div> :
        <>
          {shelf.pins.length === 0 ? <p className="shelf-empty-state">まだ何も置かれていません。下のツール一覧から「棚に入れる」を選んでください。</p> :
            <ol className="shelf-pinned-list">{shelf.pins.map((id, index) => {
              const tool = toolById(id);
              return <li key={id}>
                <span className="shelf-pin-position">{String(index + 1).padStart(2, '0')}</span>
                <Link to={tool.route}>{tool.name} <span aria-hidden="true">↗</span></Link>
                <span className="shelf-pin-actions">
                  <button type="button" aria-label={`${tool.name}を上に移動`} disabled={index === 0} onClick={() => shelf.move(id, -1)}>↑</button>
                  <button type="button" aria-label={`${tool.name}を下に移動`} disabled={index === shelf.pins.length - 1} onClick={() => shelf.move(id, 1)}>↓</button>
                  <button type="button" aria-label={`${tool.name}を棚から外す`} onClick={() => shelf.toggle(id)}>外す</button>
                </span>
              </li>;
            })}</ol>}
          {shelf.hiddenCount > 0 && <p className="shelf-caption">現在の枠数を超える登録は非表示で保持されています。</p>}
          {shelf.message && <p className="shelf-caption" role="status">{shelf.message}</p>}
          <p className="shelf-caption">並び順は、このブラウザに保存されます。<Link to="/pricing">棚のプランを見る</Link></p>
        </>
      }
    </section>

    <section id="tool-catalog" className="shelf-tool-directory" aria-labelledby="catalog-title">
      <div className="shelf-directory-heading"><div><p className="shelf-quiet-label">計算ツール一覧</p><h2 id="catalog-title">必要な計算から選ぶ</h2></div><p>全{tools.length}件 · 計算はすべて無料</p></div>
      <div className="shelf-directory-controls">
        <label htmlFor="tool-query">ツールを探す<input id="tool-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ツール名・用途を入力" /></label>
        <div className="shelf-directory-categories" role="group" aria-label="カテゴリ">{categories.map((item) => <button type="button" key={item} aria-pressed={category === item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      {filtered.length === 0 ? <div className="shelf-empty-state"><p>該当するツールがありません。</p><button type="button" onClick={() => { setQuery(''); setCategory('すべて'); }}>検索をリセット</button></div> :
        <ol className="shelf-tool-list">{filtered.map((tool) => <ToolRow key={tool.id} tool={tool} index={tool.order} pinned={shelf.pins.includes(tool.id)} onToggle={shelf.toggle} signedIn={shelf.isSignedIn} />)}</ol>}
      <p className="shelf-directory-note">使うツールを購入する必要はありません。月額プランは棚の登録枠を増やすためのものです。</p>
    </section>
  </>;
}
