import { useAuth } from '@clerk/react';
import { useEffect, useRef, useState } from 'react';
import { moveShelf, readShelf, shelfLimit, writeShelf, type ShelfPlan } from '../lib/shelf';
import type { ToolId } from '../lib/tools';

const workerUrl = import.meta.env.VITE_WORKER_API_URL;
type SelectionResponse = { plan: ShelfPlan; selectedToolIds: ToolId[]; version: number };
const validPlan = (value: unknown): value is ShelfPlan => value === 'basic' || value === 'standard' || value === 'free';
export function useShelf() {
  const { getToken, isLoaded: clerkLoaded, isSignedIn, userId } = useAuth();
  const [plan, setPlan] = useState<ShelfPlan>('free');
  const [pins, setPins] = useState<ToolId[]>([]);
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [replaceCandidate, setReplaceCandidate] = useState<ToolId | null>(null);
  const [version, setVersion] = useState(0);
  const writing = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    const current = ++generation.current;
    setReady(false); setBusy(false); setReplaceCandidate(null); setMessage('');
    setPlan('free'); setVersion(0); setPins([]);
    if (!clerkLoaded) return;
    if (!isSignedIn || !userId) { setLoadedFor(null); setReady(true); return; }
    setLoadedFor(userId);
    void (async () => {
      if (!workerUrl) { if (generation.current === current) { setMessage('契約情報の接続設定がありません。PRO機能は使えません。'); setPins(readShelf(userId)); setReady(true); } return; }
      try {
        const token = await getToken();
        if (!token) throw new Error('session_unavailable');
        const response = await fetch(`${workerUrl}/v1/pro/selections`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        if (!response.ok) throw new Error('status_unavailable');
        const data = await response.json() as SelectionResponse;
        if (!validPlan(data.plan) || !Array.isArray(data.selectedToolIds) || !Number.isSafeInteger(data.version)) throw new Error('invalid_status');
        if (generation.current !== current) return;
        setPlan(data.plan);
        setPins(data.plan === 'basic' ? data.selectedToolIds : readShelf(userId));
        setVersion(data.version);
      } catch {
        if (generation.current !== current) return;
        setPins(readShelf(userId));
        setMessage('契約情報を確認できません。PRO版は一時的に利用できません。');
      } finally {
        if (generation.current === current) setReady(true);
      }
    })();
    return () => { if (generation.current === current) generation.current++; };
  }, [clerkLoaded, getToken, isSignedIn, userId]);

  const limit = shelfLimit[plan];
  const activePins = pins.slice(0, limit);
  const change = async (next: ToolId[]) => {
    if (!userId || loadedFor !== userId || !isSignedIn || !ready || writing.current) return;
    if (next.length > limit) { setMessage(`登録できるのは最大${limit}件です。`); return; }
    if (plan !== 'basic') {
      if (!writeShelf(userId, next)) { setMessage('棚を保存できませんでした。ブラウザの保存設定をご確認ください。'); return; }
      setPins(next); setReplaceCandidate(null); setMessage('棚を更新しました。');
      return;
    }
    if (!workerUrl) { setMessage('PRO枠の保存先に接続できません。'); return; }
    writing.current = true; setBusy(true); setMessage('');
    const current = generation.current;
    try {
      const token = await getToken();
      if (!token) throw new Error('session_unavailable');
      const response = await fetch(`${workerUrl}/v1/pro/selections`, { method: 'POST', cache: 'no-store',
        headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ toolIds: next, version }) });
      if (response.status === 409) {
        const latest = await fetch(`${workerUrl}/v1/pro/selections`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        if (latest.ok) {
          const data = await latest.json() as SelectionResponse;
          if (generation.current === current && data.plan === 'basic') {
            setPins(data.selectedToolIds); setVersion(data.version); setReplaceCandidate(null);
            setMessage('別の端末で棚が変更されました。最新の状態に更新したので、もう一度操作してください。');
          }
        }
        return;
      }
      if (!response.ok) throw new Error('save_failed');
      const data = await response.json() as { selectedToolIds: ToolId[]; version: number };
      if (generation.current === current) {
        setPins(data.selectedToolIds); setVersion(data.version); setReplaceCandidate(null);
        setMessage('PRO対象を更新しました。');
      }
    } catch {
      if (generation.current === current) setMessage('PRO対象を変更できませんでした。元の登録は保持されています。');
    } finally {
      writing.current = false;
      if (generation.current === current) setBusy(false);
    }
  };
  const toggle = (id: ToolId) => {
    if (!ready || busy) return;
    if (pins.includes(id)) { void change(pins.filter((item) => item !== id)); return; }
    if (pins.length >= limit) {
      if (plan === 'basic') { setReplaceCandidate(id); setMessage('PRO枠は5件です。どのツールと入れ替えるか選んでください。'); }
      else setMessage(`棚は現在${limit}個までです。`);
      return;
    }
    void change([...pins, id]);
  };
  const replace = (oldId: ToolId, newId = replaceCandidate) => {
    if (plan !== 'basic' || !newId || !pins.includes(oldId) || (newId !== oldId && pins.includes(newId))) return;
    void change(pins.map((id) => id === oldId ? newId : id));
  };
  const move = (id: ToolId, direction: -1 | 1) => { if (!busy) void change(moveShelf(pins, id, direction)); };
  return {
    plan, pins: activePins, limit, message, toggle, replace, move, replaceCandidate,
    cancelReplace: () => setReplaceCandidate(null), busy,
    canPro: (id: ToolId) => ready && (plan === 'standard' || (plan === 'basic' && activePins.includes(id))),
    isSignedIn: !!isSignedIn && !!userId, isLoaded: ready, full: pins.length >= limit,
    hiddenCount: Math.max(0, pins.length - limit),
  };
}
