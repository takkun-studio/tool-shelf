import { useAuth } from '@clerk/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Results } from '../lib/calculators';
import { calculate } from '../lib/calculators';
import { downloadCsv } from '../lib/csv';
import { defaultName, loadScenarios, persist, storageWarning, type Scenario } from '../lib/storage';
import { toolById, type ToolId } from '../lib/tools';
import { parsed, valid, validate, type Inputs } from '../lib/validation';
import { NumberField } from '../components/NumberField';
import { ResultsView } from '../components/Results';

const workerUrl = import.meta.env.VITE_WORKER_API_URL;
const empty = (id: ToolId): Inputs => Object.fromEntries(toolById(id).fields.map((field) => [field.key, '']));

export function ToolPage({ id }: { id: ToolId }) {
  const tool = toolById(id);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [inputs, setInputs] = useState<Inputs>(() => empty(id));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadScenarios());
  const [notice, setNotice] = useState(() => storageWarning());
  const [scenarioName, setScenarioName] = useState('');
  const [remoteResults, setRemoteResults] = useState<Results>();
  const [remoteMessage, setRemoteMessage] = useState<string>();
  const errors = useMemo(() => validate(tool.fields, inputs), [tool, inputs]);
  const isValid = valid(errors);
  const own = scenarios.filter((scenario) => scenario.toolId === id);

  const calculatePaid = useCallback(async (toolId: ToolId, source: Inputs): Promise<Results> => {
    if (!workerUrl) throw new Error('有料計算APIが未設定です。');
    const token = await getToken();
    if (!token) throw new Error('ログインが必要です。');
    const response = await fetch(`${workerUrl}/v1/calculators/${toolId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(parsed(source)),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: unknown } | null;
      throw new Error(typeof body?.error === 'string' ? body.error : '有料計算APIに接続できませんでした。');
    }
    return response.json() as Promise<Results>;
  }, [getToken]);

  useEffect(() => {
    if (tool.access !== 'paid') return;
    if (!isValid) {
      setRemoteResults(undefined);
      setRemoteMessage(undefined);
      return;
    }
    if (!isLoaded) {
      setRemoteResults(undefined);
      setRemoteMessage('認証状態を確認しています。');
      return;
    }
    if (!isSignedIn) {
      setRemoteResults(undefined);
      setRemoteMessage(`このツールはログインと${tool.minimumPlan === 'basic' ? 'Basic' : 'Standard'}以上のplanが必要です。`);
      return;
    }
    let active = true;
    setRemoteResults(undefined);
    setRemoteMessage('認証済みの有料計算を確認しています。');
    void calculatePaid(id, inputs).then((result) => {
      if (active) {
        setRemoteResults(result);
        setRemoteMessage(undefined);
      }
    }).catch((error: unknown) => {
      if (active) {
        setRemoteResults(undefined);
        setRemoteMessage(error instanceof Error ? error.message : '有料計算APIに接続できませんでした。');
      }
    });
    return () => { active = false; };
  }, [calculatePaid, id, inputs, isLoaded, isSignedIn, isValid, tool.access, tool.minimumPlan]);

  const localResults = tool.access === 'free' && isValid ? calculate(id, parsed(inputs)) : undefined;
  const results = tool.access === 'paid' ? remoteResults : localResults;
  const save = () => {
    if (!isValid || !results) {
      setShowErrors(true);
      setNotice('有効な値をすべて入力し、計算が完了してから保存してください。');
      return;
    }
    const now = new Date().toISOString();
    const next = [...scenarios, { id: crypto.randomUUID(), toolId: id, name: scenarioName.trim() || defaultName(), inputs: structuredClone(inputs), createdAt: now, updatedAt: now }];
    if (persist(next)) {
      setScenarios(next);
      setNotice('試算を保存しました。');
      setScenarioName('');
    }
  };
  const rename = (scenario: Scenario) => {
    const name = window.prompt('試算名', scenario.name);
    if (name === null) return;
    const next = scenarios.map((item) => item.id === scenario.id ? { ...item, name: name || defaultName(), updatedAt: new Date().toISOString() } : item);
    if (persist(next)) {
      setScenarios(next);
      setNotice('名前を変更しました。');
    }
  };
  const remove = (scenario: Scenario) => {
    if (!window.confirm(`「${scenario.name}」を削除しますか？`)) return;
    const next = scenarios.filter((item) => item.id !== scenario.id);
    if (persist(next)) {
      setScenarios(next);
      setNotice('試算を削除しました。');
    }
  };
  const exportScenario = async (scenario: Scenario) => {
    try {
      const scenarioResults = tool.access === 'paid' ? await calculatePaid(id, scenario.inputs) : calculate(id, parsed(scenario.inputs));
      downloadCsv(tool, scenario.name, scenario.updatedAt, scenario.inputs, scenarioResults);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'CSVを出力できませんでした。');
    }
  };

  return <>
    <Link className="back" to="/">← ツール一覧へ</Link>
    <section className="tool-heading"><p>{tool.access === 'paid' ? 'PRO対象' : tool.category}</p><h1>{tool.name}</h1><div>{tool.shortDescription}</div>{tool.access === 'paid' && <p className="pro-note">このツールは認証済みの{tool.minimumPlan === 'basic' ? 'Basic' : 'Standard'}以上のplanで利用できます。</p>}</section>
    <div className="workspace"><section className="inputs"><h2>入力</h2>{tool.fields.map((field) => <NumberField key={field.key} field={field} value={inputs[field.key]} error={showErrors || touched[field.key] ? errors[field.key] : undefined} onChange={(value) => { setTouched((current) => ({ ...current, [field.key]: true })); setInputs((current) => ({ ...current, [field.key]: value })); }} />)}<button className="secondary" onClick={() => { setInputs(empty(id)); setTouched({}); setShowErrors(false); setNotice('入力をリセットしました。'); }}>入力をリセット</button></section><ResultsView results={results} message={tool.access === 'paid' ? remoteMessage : undefined} /></div>
    <section className="actions"><h2>保存・CSV</h2>{notice && <p className="notice" role="status">{notice}</p>}<label>試算名（空欄なら日時から作成）<textarea value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} style={{ width: '100%', minHeight: 46, marginTop: 8, padding: '8px 11px', font: 'inherit', fontSize: 17 }} /></label><div className="action-buttons"><button onClick={save}>この試算を保存</button><button className="secondary" disabled={!results} onClick={() => results && downloadCsv(tool, '未保存の試算', new Date().toISOString(), inputs, results)}>現在の試算をCSV出力</button></div></section>
    <section className="saved"><h2>保存済み試算</h2>{own.length === 0 ? <p>まだ保存した試算はありません。</p> : <ul>{own.map((scenario) => <li key={scenario.id}><div><b>{scenario.name}</b><small>更新: {new Date(scenario.updatedAt).toLocaleString('ja-JP')}</small></div><div><button onClick={() => { setInputs(structuredClone(scenario.inputs)); setTouched({}); setShowErrors(false); setNotice('保存済み試算を読み込みました。'); }}>読み込み</button><button onClick={() => rename(scenario)}>名前変更</button><button onClick={() => remove(scenario)}>削除</button><button onClick={() => { void exportScenario(scenario); }}>CSV</button></div></li>)}</ul>}</section>
  </>;
}
