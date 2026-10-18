import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShelf } from '../hooks/useShelf';
import { tools, toolById, type Tool, type ToolId } from '../lib/tools';

function ToolRow({ tool, index, pinned, proEnabled, plan, onToggle, signedIn, busy }: {
  tool: Tool;
  index: number;
  pinned: boolean;
  proEnabled: boolean;
  plan: 'free' | 'basic' | 'standard';
  onToggle: (id: ToolId) => void;
  signedIn: boolean;
  busy: boolean;
}) {
  const buttonLabel = plan === 'basic'
    ? pinned ? 'PRO対象から外す' : '＋ PROに追加'
    : pinned ? '棚から外す' : '＋ 棚に入れる';

  return <li className="shelf-tool-row">
    <span className="shelf-tool-index">{String(index).padStart(2, '0')}</span>
    <Link to={tool.route} className="shelf-tool-link">
      <span className="shelf-tool-name">
        {tool.name}
        {proEnabled && <b className="shelf-pro-badge">PRO対象</b>}
        <small>{tool.category}</small>
      </span>
      <span className="shelf-tool-detail">{tool.shortDescription}</span>
      <span aria-hidden="true" className="shelf-tool-go">開く →</span>
    </Link>
    {signedIn && <button
      type="button"
      className="shelf-tool-pin"
      disabled={busy}
      aria-label={tool.name + 'を' + (pinned ? '棚から外す' : '棚に追加する')}
      aria-pressed={pinned}
      onClick={() => onToggle(tool.id)}
    >{buttonLabel}</button>}
  </li>;
}

export function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('すべて');
  const shelf = useShelf();
  const categories = useMemo(() => ['すべて', ...new Set(tools.map((tool) => tool.category))], []);
  const filtered = useMemo(() => tools.filter((tool) =>
    (category === 'すべて' || tool.category === category) &&
    [tool.name, tool.shortDescription, tool.category].join(' ').toLocaleLowerCase('ja-JP').includes(query.trim().toLocaleLowerCase('ja-JP'))
  ).sort((a, b) => a.order - b.order), [category, query]);

  const shelfTitle = shelf.plan === 'basic' ? 'PROにする5件' : '自分の棚';
  const shelfCount = shelf.plan === 'standard'
    ? shelf.pins.length + ' / 10 枠・全ツールPRO'
    : shelf.pins.length + ' / ' + shelf.limit + (shelf.plan === 'basic' ? ' PRO枠' : ' 枠');

  return <>
    <section className="shelf-intro">
      <div className="shelf-intro-primary">
        <p className="shelf-quiet-label">個人販売・小さなお店の計算道具</p>
        <h1>数字を出す。<br/>判断は、自分でする。</h1>
        <p>原価、出店費用、売上目標。必要な計算を、必要なときに。<br/>全10ツール、会員登録なしでも通常版は無料で使えます。</p>
        <a className="shelf-intro-link" href="#tool-catalog">計算ツールを見る <span aria-hidden="true">↓</span></a>
      </div>
      <div className="shelf-intro-secondary">
        <p className="shelf-small-heading">PRO版について</p>
        <h2>必要なPROだけ選べます。</h2>
        <p>月480円は棚に入れた5件だけPRO対象。月980円は全ツールがPRO対象です。通常版はどのプランでも無料です。</p>
        <Link to={shelf.isSignedIn ? '/pricing' : '/login'}>{shelf.isSignedIn ? 'PRO版の料金を見る' : '無料で棚を作る'} <span aria-hidden="true">→</span></Link>
      </div>
    </section>

    <section className="shelf-my-tools" aria-labelledby="my-tools-title">
      <div className="shelf-my-tools-top">
        <h2 id="my-tools-title">{shelfTitle}</h2>
        {shelf.isSignedIn && <span>{shelfCount}</span>}
      </div>

      {!shelf.isLoaded ? <p>契約状態を確認しています。</p> : !shelf.isSignedIn ?
        <div className="shelf-empty-state">
          <p>通常版はこのまま無料で使えます。よく使うツールを並べたい方は、無料登録から。</p>
          <Link to="/login">棚を使うために登録する →</Link>
        </div> :
        <>
          {shelf.pins.length === 0 ? <p className="shelf-empty-state">
            {shelf.plan === 'basic'
              ? '下のツール一覧から、PRO版を使いたい5件を選んでください。'
              : shelf.plan === 'standard'
                ? '全ツールがPRO対象です。よく使うツールを10件まで棚に並べられます。'
                : 'まだ何も置かれていません。下のツール一覧から「棚に入れる」を選んでください。'}
          </p> :
            <ol className="shelf-pinned-list">{shelf.pins.map((id, index) => {
              const tool = toolById(id);
              return <li key={id}>
                <span className="shelf-pin-position">{String(index + 1).padStart(2, '0')}</span>
                <Link to={tool.route}>{tool.name}{shelf.canUsePro(id) && <b className="shelf-pro-badge">PRO対象</b>} <span aria-hidden="true">↗</span></Link>
                <span className="shelf-pin-actions">
                  <button type="button" aria-label={tool.name + 'を上に移動'} disabled={shelf.busy || index === 0} onClick={() => shelf.move(id, -1)}>↑</button>
                  <button type="button" aria-label={tool.name + 'を下に移動'} disabled={shelf.busy || index === shelf.pins.length - 1} onClick={() => shelf.move(id, 1)}>↓</button>
                  <button type="button" aria-label={tool.name + 'を棚から外す'} disabled={shelf.busy} onClick={() => shelf.toggle(id)}>外す</button>
                </span>
              </li>;
            })}</ol>}

          {shelf.plan === 'basic' && shelf.replaceCandidate && <div className="shelf-pro-swap">
            <strong>「{toolById(shelf.replaceCandidate).name}」と入れ替えるツールを選んでください。</strong>
            <div>{shelf.pins.map((id) => <button type="button" key={id} disabled={shelf.busy} onClick={() => shelf.replace(id)}>
              {toolById(id).name} と入れ替える
            </button>)}</div>
            <button type="button" className="shelf-pro-swap-cancel" disabled={shelf.busy} onClick={shelf.cancelReplace}>キャンセル</button>
          </div>}

          {shelf.hiddenCount > 0 && <p className="shelf-caption">現在の枠数を超える登録は非表示で保持されています。</p>}
          {shelf.message && <p className="shelf-caption" role="status">{shelf.message}</p>}
          <p className="shelf-caption">
            {shelf.plan === 'basic'
              ? 'PRO対象5件はアカウントに保存されます。'
              : shelf.plan === 'standard'
                ? '全ツールPRO対象。棚の並び順はこのブラウザに保存されます。'
                : '棚の並び順は、このブラウザに保存されます。'}
            {' '}<Link to="/pricing">料金を見る</Link>
          </p>
        </>
      }
    </section>

    <section id="tool-catalog" className="shelf-tool-directory" aria-labelledby="catalog-title">
      <div className="shelf-directory-heading">
        <div><p className="shelf-quiet-label">計算ツール一覧</p><h2 id="catalog-title">必要な計算から選ぶ</h2></div>
        <p>全{tools.length}件 · 通常版はすべて無料</p>
      </div>
      <div className="shelf-directory-controls">
        <label htmlFor="tool-query">ツールを探す<input id="tool-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ツール名・用途を入力" /></label>
        <div className="shelf-directory-categories" role="group" aria-label="カテゴリ">{categories.map((item) =>
          <button type="button" key={item} aria-pressed={category === item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
        )}</div>
      </div>

      {filtered.length === 0 ? <div className="shelf-empty-state"><p>該当するツールがありません。</p><button type="button" onClick={() => { setQuery(''); setCategory('すべて'); }}>検索をリセット</button></div> :
        <ol className="shelf-tool-list">{filtered.map((tool) => <ToolRow
          key={tool.id}
          tool={tool}
          index={tool.order}
          pinned={shelf.pins.includes(tool.id)}
          proEnabled={shelf.canUsePro(tool.id)}
          plan={shelf.plan}
          onToggle={shelf.toggle}
          signedIn={shelf.isSignedIn}
          busy={shelf.busy}
        />)}</ol>}

      <p className="shelf-directory-note">通常版は全ツール無料。月480円は選んだ5件、月980円は全ツールがPRO対象です。</p>
    </section>
  </>;
}
