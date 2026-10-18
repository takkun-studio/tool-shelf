import { useAuth } from '@clerk/react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { calculate } from '../lib/calculators';
import { downloadCsv } from '../lib/csv';
import { defaultName, loadScenarios, persist, storageWarning, type Scenario } from '../lib/storage';
import { toolById, type ToolId } from '../lib/tools';
import { parsed, valid, validate, type Inputs } from '../lib/validation';
import { NumberField } from '../components/NumberField';
import { ResultsView } from '../components/Results';

const empty = (id: ToolId): Inputs => Object.fromEntries(toolById(id).fields.map((field) => [field.key, '']));

export function ToolPage({ id }: { id: ToolId }) {
  const tool = toolById(id);
  const { isLoaded, isSignedIn } = useAuth();
  const [inputs, setInputs] = useState<Inputs>(() => empty(id));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadScenarios());
  const [notice, setNotice] = useState(() => storageWarning());
  const [scenarioName, setScenarioName] = useState('');
  const errors = useMemo(() => validate(tool.fields, inputs), [tool, inputs]);
  const isValid = valid(errors);
  // All ten tools share local, subscription-free calculation. Access to the shelf is separate.
  const results = isValid ? calculate(id, parsed(inputs)) : undefined;
  const own = scenarios.filter((scenario) => scenario.toolId === id);

  const save = () => {
    if (!isSignedIn) { setNotice('試算を保存するには無料登録が必要です。計算とCSV出力は登録せずに使えます。'); return; }
    if (!isValid || !results) {
      setShowErrors(true);
      setNotice('有効な値をすべて入力してから保存してください。');
      return;
    }
    const now = new Date().toISOString();
    const next = [...scenarios, { id: crypto.randomUUID(), toolId: id, name: scenarioName.trim() || defaultName(), inputs: structuredClone(inputs), createdAt: now, updatedAt: now }];
    if (persist(next)) { setScenarios(next); setNotice('試算をこのブラウザに保存しました。'); setScenarioName(''); }
    else setNotice(storageWarning());
  };
  const rename = (scenario: Scenario) => {
    const name = window.prompt('試算名', scenario.name);
    if (name === null) return;
    const next = scenarios.map((item) => item.id === scenario.id ? { ...item, name: name || defaultName(), updatedAt: new Date().toISOString() } : item);
    if (persist(next)) { setScenarios(next); setNotice('名前を変更しました。'); }
    else setNotice(storageWarning());
  };
  const remove = (scenario: Scenario) => {
    if (!window.confirm(`「${scenario.name}」を削除しますか？`)) return;
    const next = scenarios.filter((item) => item.id !== scenario.id);
    if (persist(next)) { setScenarios(next); setNotice('試算を削除しました。'); }
    else setNotice(storageWarning());
  };
  const exportScenario = (scenario: Scenario) => {
    try { downloadCsv(tool, scenario.name, scenario.updatedAt, scenario.inputs, calculate(id, parsed(scenario.inputs))); }
    catch { setNotice('CSVを出力できませんでした。'); }
  };
  return <>
    <Link className="back" to="/">← ツール一覧へ</Link>
    <section className="tool-heading"><p>{tool.category} · 無料で使える計算ツール</p><h1>{tool.name}</h1><div>{tool.shortDescription}</div></section>
    <div className="workspace"><section className="inputs"><h2>入力</h2>{tool.fields.map((field) => <NumberField key={field.key} field={field} value={inputs[field.key]} error={showErrors || touched[field.key] ? errors[field.key] : undefined} onChange={(value) => { setTouched((current) => ({ ...current, [field.key]: true })); setInputs((current) => ({ ...current, [field.key]: value })); }}/>)}
      <button className="secondary" onClick={() => { setInputs(empty(id)); setTouched({}); setShowErrors(false); setNotice('入力をリセットしました。'); }}>入力をリセット</button>
    </section><ResultsView results={results}/></div>
    <section className="actions"><h2>結果を持ち帰る</h2>{notice && <p className="notice" role="status">{notice}</p>}
      <div className="action-buttons"><button className="secondary" disabled={!results} onClick={() => results && downloadCsv(tool, '未保存の試算', new Date().toISOString(), inputs, results)}>現在の試算をCSV出力（無料）</button></div>
      {isLoaded && !isSignedIn && <p className="shelf-signup-note">会員登録しなくても全ツールを計算できます。<Link to="/login">無料登録すると試算を保存できます →</Link></p>}
      {isSignedIn && <><h3>試算をこのブラウザに保存</h3><label>試算名（空欄なら日時で保存）<textarea value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} style={{ width: '100%', minHeight: 46, marginTop: 8, padding: '8px 11px', font: 'inherit', fontSize: 17 }} /></label>
        <div className="action-buttons"><button onClick={save}>試算を保存</button></div></>}
    </section>
    {isSignedIn && <section className="saved"><h2>保存済み試算</h2>{own.length === 0 ? <p>まだ保存した試算はありません。</p> : <ul>{own.map((scenario) => <li key={scenario.id}><div><b>{scenario.name}</b><small>更新: {new Date(scenario.updatedAt).toLocaleString('ja-JP')}</small></div><div><button onClick={() => { setInputs(structuredClone(scenario.inputs)); setTouched({}); setShowErrors(false); setNotice('保存済み試算を読み込みました。'); }}>読み込み</button><button onClick={() => rename(scenario)}>名前変更</button><button onClick={() => remove(scenario)}>削除</button><button onClick={() => exportScenario(scenario)}>CSV</button></div></li>)}</ul>}</section>}
  </>;
}
