import type { Results } from '../lib/calculators';

const fmt = (value: number | null, type?: string, unit?: string) => {
  if (value === null) return '—';
  const n = value.toLocaleString('ja-JP', { maximumFractionDigits: 2 });
  if (type === 'percent') return `${n}%`;
  if (type === 'quantity') return `${n} ${unit ?? '個'}`;
  if (type === 'number') return unit ? `${n} ${unit}` : n;
  return `${n} 円`;
};

export function ResultsView({ results, message }: { results: Results | undefined; message?: string }) {
  if (!results) return <section className="results pending" aria-live="polite"><h2>計算結果</h2><p>{message ?? 'すべての項目を有効な値で入力すると結果を表示します。'}</p></section>;
  const primary = results.rows.slice(0, 1);
  return <section className={`results ${results.loss ? 'loss' : ''}`} aria-live="polite">
    <h2>計算結果</h2>
    {results.status && <p className="status">計算不能: {results.status}</p>}
    {results.summary && <p className="status">{results.summary}</p>}
    <div className="primary">{primary.map((row) => <div key={row.key}><span>{row.label}</span><strong>{fmt(row.value, row.type, row.unit)}</strong></div>)}</div>
    <dl>{results.rows.slice(1).map((row) => <div key={row.key}><dt>{row.label}</dt><dd>{fmt(row.value, row.type, row.unit)}</dd></div>)}</dl>
  </section>;
}
