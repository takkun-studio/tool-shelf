import { useAuth } from '@clerk/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShelf } from '../hooks/useShelf';
import type { Results } from '../lib/calculators';
import { parsed, valid, validate, type Inputs } from '../lib/validation';
import { toolById, type ToolId } from '../lib/tools';
import { NumberField } from './NumberField';
import { ResultsView } from './Results';

const workerUrl = import.meta.env.VITE_WORKER_API_URL;
type CompareResult = { current: Results; alternative: Results; differences: Results['rows'] };
const format = (value: number | null, type?: string) => value === null ? '計算不可' :
  `${value > 0 ? '+' : ''}${value.toLocaleString('ja-JP', { maximumFractionDigits: 2 })}${type === 'money' ? ' 円' : type === 'percent' ? ' %' : type === 'quantity' ? ' 個' : ''}`;

export function ProCompare({ id, inputs }: { id: ToolId; inputs: Inputs }) {
  const shelf = useShelf();
  const { getToken } = useAuth();
  const tool = toolById(id);
  const [opened, setOpened] = useState(false);
  const [alternative, setAlternative] = useState<Inputs>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState('');
  const altErrors = validate(tool.fields, alternative);
  const compare = async () => {
    if (!valid(validate(tool.fields, inputs)) || !valid(altErrors)) {
      setAttempted(true); setError('両方の入力をすべて有効な数字で埋めてください。'); return;
    }
    setBusy(true); setResult(null); setError('');
    try {
      if (!workerUrl) throw new Error('server_unavailable');
      const token = await getToken();
      if (!token) throw new Error('session_unavailable');
      const response = await fetch(`${workerUrl}/v1/pro/compare/${id}`, {
        method: 'POST', cache: 'no-store',
        headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ current: parsed(inputs), alternative: parsed(alternative) }),
      });
      if (response.status === 403) { setError('このPRO版の利用権限がありません。契約と登録ツールを確認してください。'); return; }
      if (!response.ok) throw new Error('compare_failed');
      setResult(await response.json() as CompareResult);
    } catch { setError('PRO比較に接続できません。元の試算は変更されていません。'); }
    finally { setBusy(false); }
  };
  return <section className="pro-workbench" aria-labelledby="pro-workbench-heading">
    <div className="pro-workbench-head"><div><span className="pro-flag">PRO</span><h2 id="pro-workbench-heading">2案を並べて比べる</h2></div>
      <span>通常計算は今までどおり無料</span></div>
    {!shelf.isLoaded ? <p className="pro-help">利用できる機能を確認しています。</p> :
      shelf.canPro(id) ? <>
        <p className="pro-help">いまの入力を「A案」とし、条件を変えた「B案」の結果と差額を比較できます。</p>
        {!opened ? <button className="pro-main-button" type="button" onClick={() => {
          setAlternative({ ...inputs }); setResult(null); setError(''); setTouched({}); setAttempted(false); setOpened(true);
        }}>PRO比較を開く ↗</button> :
          <div className="pro-workbench-body">
            <div className="pro-compare-fields"><div className="pro-compare-caption">B案 <small>左上の通常入力がA案です</small></div>
              {tool.fields.map(field => <NumberField key={field.key} field={field} value={alternative[field.key] ?? ''}
                error={attempted || touched[field.key] ? altErrors[field.key] : undefined}
                onChange={value => { setAlternative(prev => ({ ...prev, [field.key]: value })); setTouched(prev => ({ ...prev, [field.key]: true })); setResult(null); }}/>)}
              <button type="button" className="pro-main-button" disabled={busy} onClick={() => { void compare(); }}>{busy ? '比較しています…' : 'A案とB案を比較'}</button>
            </div>
            {error && <p className="pro-error" role="alert">{error}</p>}
            {result && <div className="pro-compare-results" aria-live="polite">
              <div><h3>A案</h3><ResultsView results={result.current}/></div>
              <div><h3>B案</h3><ResultsView results={result.alternative}/></div>
              <div className="pro-differences"><h3>差（B − A）</h3>
                <dl>{result.differences.map(row => <div key={row.key}><dt>{row.label}</dt><dd>{format(row.value, row.type)}</dd></div>)}</dl>
              </div>
            </div>}
          </div>}
      </> : <>
        <p className="pro-help">{shelf.plan === 'basic'
          ? '月480円プランでは、棚に入れた5ツールだけPRO版が使えます。'
          : shelf.plan === 'standard' ? '契約情報を読み込めませんでした。' : '選んだ5件でPRO版を使うか、全ツールのPRO版を使うかを選べます。'}</p>
        {shelf.isSignedIn && shelf.plan === 'basic' ?
          <><button type="button" className="pro-main-button" disabled={shelf.busy} onClick={() => shelf.toggle(id)}>このツールをPRO枠に追加</button>
            {shelf.replaceCandidate === id && <div className="pro-swap"><p>入れ替えるツールを選ぶ（登録した5件のうち1件）</p>
              {shelf.pins.map(oldId => <button type="button" key={oldId} disabled={shelf.busy} onClick={() => shelf.replace(oldId, id)}>{toolById(oldId).name} と入れ替える</button>)}
              <button type="button" onClick={shelf.cancelReplace}>キャンセル</button></div>}
          </> : <Link className="pro-plan-link" to="/pricing">PROプランを見る ↗</Link>}
        {shelf.message && <p className="pro-help" role="status">{shelf.message}</p>}
      </>}
  </section>;
}
