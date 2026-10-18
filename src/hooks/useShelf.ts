import { useAuth } from '@clerk/react';
import { useEffect, useRef, useState } from 'react';
import { moveShelf, readShelf, shelfLimit, writeShelf, type ShelfPlan } from '../lib/shelf';
import { tools, type ToolId } from '../lib/tools';

const workerUrl = import.meta.env.VITE_WORKER_API_URL;

type ProStatus = {
  plan?: unknown;
  selectedToolIds?: unknown;
  version?: unknown;
  allPro?: unknown;
  limit?: unknown;
};

const isPlan = (value: unknown): value is ShelfPlan =>
  value === 'free' || value === 'basic' || value === 'standard';

const knownToolIds = new Set<string>(tools.map((tool) => tool.id));
const isToolIds = (value: unknown): value is ToolId[] =>
  Array.isArray(value) &&
  value.length <= 5 &&
  new Set(value).size === value.length &&
  value.every((item) => typeof item === 'string' && knownToolIds.has(item));

export function useShelf() {
  const { getToken, isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const [plan, setPlan] = useState<ShelfPlan>('free');
  const [pins, setPins] = useState<ToolId[]>([]);
  const [version, setVersion] = useState(0);
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [replaceCandidate, setReplaceCandidate] = useState<ToolId | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    setReady(false);
    setBusy(false);
    setReplaceCandidate(null);
    setMessage('');
    setPlan('free');
    setVersion(0);

    if (!authLoaded) return;
    if (!isSignedIn || !userId) {
      setPins([]);
      setReady(true);
      return;
    }

    const localPins = readShelf(userId);
    setPins(localPins);

    if (!workerUrl) {
      setMessage('契約情報に接続できないため、PRO判定は一時停止しています。');
      setReady(true);
      return;
    }

    void (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('missing_session');

        const response = await fetch(`${workerUrl}/v1/pro/status`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('status_unavailable');

        const data = await response.json() as ProStatus;
        if (!isPlan(data.plan)) throw new Error('invalid_plan');

        if (requestId.current !== currentRequest) return;
        setPlan(data.plan);

        if (data.plan === 'basic') {
          if (!isToolIds(data.selectedToolIds) || typeof data.version !== 'number' || !Number.isSafeInteger(data.version)) {
            throw new Error('invalid_selection');
          }
          setPins(data.selectedToolIds);
          setVersion(data.version);
        } else {
          setPins(localPins);
        }
      } catch {
        if (requestId.current !== currentRequest) return;
        setPlan('free');
        setPins(localPins);
        setMessage('契約情報を確認できませんでした。通常版は使えますが、PRO判定は一時停止しています。');
      } finally {
        if (requestId.current === currentRequest) setReady(true);
      }
    })();

    return () => {
      if (requestId.current === currentRequest) requestId.current += 1;
    };
  }, [authLoaded, getToken, isSignedIn, userId]);

  const limit = shelfLimit[plan];
  const activePins = pins.slice(0, limit);

  const saveLocal = (next: ToolId[]) => {
    if (!userId || !isSignedIn) return;
    if (!writeShelf(userId, next)) {
      setMessage('棚を保存できませんでした。ブラウザの保存設定を確認してください。');
      return;
    }
    setPins(next);
    setMessage('棚を更新しました。');
  };

  const saveBasic = async (next: ToolId[]) => {
    if (!userId || !isSignedIn || !workerUrl || busy) return;
    if (next.length > 5) {
      setMessage('月480円プランのPRO対象は5件までです。');
      return;
    }

    setBusy(true);
    const currentRequest = requestId.current;
    try {
      const token = await getToken();
      if (!token) throw new Error('missing_session');

      const response = await fetch(`${workerUrl}/v1/pro/selection`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ toolIds: next, version }),
      });

      if (response.status === 409) {
        const latest = await fetch(`${workerUrl}/v1/pro/status`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (latest.ok) {
          const data = await latest.json() as ProStatus;
          if (requestId.current === currentRequest && data.plan === 'basic' && isToolIds(data.selectedToolIds) && typeof data.version === 'number') {
            setPins(data.selectedToolIds);
            setVersion(data.version);
            setReplaceCandidate(null);
            setMessage('別の画面で変更されていたため、最新の5件に更新しました。もう一度操作してください。');
          }
        }
        return;
      }

      if (!response.ok) throw new Error('save_failed');
      const data = await response.json() as ProStatus;
      if (!isToolIds(data.selectedToolIds) || typeof data.version !== 'number') throw new Error('invalid_response');

      if (requestId.current === currentRequest) {
        setPins(data.selectedToolIds);
        setVersion(data.version);
        setReplaceCandidate(null);
        setMessage('PRO対象を更新しました。');
      }
    } catch {
      if (requestId.current === currentRequest) {
        setMessage('PRO対象を変更できませんでした。変更前の5件はそのままです。');
      }
    } finally {
      if (requestId.current === currentRequest) setBusy(false);
    }
  };

  const change = (next: ToolId[]) => {
    if (!ready || busy) return;
    if (plan === 'basic') {
      void saveBasic(next);
      return;
    }
    saveLocal(next);
  };

  const toggle = (id: ToolId) => {
    if (!ready || busy || !isSignedIn || !userId) return;

    if (pins.includes(id)) {
      change(pins.filter((item) => item !== id));
      return;
    }

    if (pins.length >= limit) {
      if (plan === 'basic') {
        setReplaceCandidate(id);
        setMessage('PRO枠は5件です。入れ替えるツールを選んでください。');
      } else {
        setMessage(`棚は現在${limit}件までです。`);
      }
      return;
    }

    change([...pins, id]);
  };

  const replace = (oldId: ToolId) => {
    if (plan !== 'basic' || !replaceCandidate || busy || !pins.includes(oldId)) return;
    change(pins.map((id) => id === oldId ? replaceCandidate : id));
  };

  const move = (id: ToolId, direction: -1 | 1) => {
    if (!busy) change(moveShelf(pins, id, direction));
  };

  const canUsePro = (id: ToolId) =>
    ready && (plan === 'standard' || (plan === 'basic' && activePins.includes(id)));

  return {
    plan,
    pins: activePins,
    limit,
    message,
    toggle,
    replace,
    replaceCandidate,
    cancelReplace: () => setReplaceCandidate(null),
    move,
    canUsePro,
    busy,
    isSignedIn: !!isSignedIn && !!userId,
    isLoaded: ready,
    full: pins.length >= limit,
    hiddenCount: Math.max(0, pins.length - limit),
  };
}
