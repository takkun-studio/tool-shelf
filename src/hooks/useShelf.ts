import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';
import { moveShelf, readShelf, shelfLimit, writeShelf, type ShelfPlan } from '../lib/shelf';
import type { ToolId } from '../lib/tools';

const workerUrl = import.meta.env.VITE_WORKER_API_URL;
export function useShelf() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const [plan, setPlan] = useState<ShelfPlan>('free');
  const [pins, setPins] = useState<ToolId[]>([]);
  const [message, setMessage] = useState('');
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setPins(userId ? readShelf(userId) : []);
    setLoadedFor(userId ?? null);
    setPlan('free');
    setMessage('');
    if (isLoaded && isSignedIn && userId && workerUrl) {
      void (async () => {
        try {
          const token = await getToken();
          if (!token) return;
          const response = await fetch(`${workerUrl}/v1/billing/status`, { headers: { Authorization: `Bearer ${token}` } });
          if (!response.ok) return;
          const data = await response.json() as { plan?: unknown };
          if (active && (data.plan === 'basic' || data.plan === 'standard')) setPlan(data.plan);
        } catch { /* Keep free shelf accessible when billing is unavailable. */ }
      })();
    }
    return () => { active = false; };
  }, [getToken, isLoaded, isSignedIn, userId]);

  const limit = shelfLimit[plan];
  const activePins = pins.slice(0, limit);
  const change = (next: ToolId[]) => {
    if (!userId || loadedFor !== userId || !isSignedIn) return;
    if (!writeShelf(userId, next)) { setMessage('棚を保存できませんでした。ブラウザの保存設定を確認してください。'); return; }
    setPins(next);
    setMessage('棚を更新しました。このブラウザに保存されています。');
  };
  const toggle = (id: ToolId) => {
    if (pins.includes(id)) { change(pins.filter((item) => item !== id)); return; }
    if (pins.length >= limit) { setMessage(`棚は現在${limit}個までです。入れ替えるか、料金プランをご確認ください。`); return; }
    change([...pins, id]);
  };
  const move = (id: ToolId, direction: -1 | 1) => change(moveShelf(pins, id, direction));
  return { plan, pins: activePins, limit, message, toggle, move, isSignedIn: !!isSignedIn && !!userId, isLoaded, full: pins.length >= limit, hiddenCount: Math.max(0, pins.length - limit) };
}
