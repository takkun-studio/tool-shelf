import { SignOutButton, Show, useAuth, useUser } from '@clerk/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const workerUrl = import.meta.env.VITE_WORKER_API_URL;
type BillingStatus = {
  plan: 'free' | 'basic' | 'standard';
  subscriptionStatus: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
};

const planLabel = (plan: BillingStatus['plan'] | undefined) =>
  plan === 'basic' ? '月480円 / 5件PRO'
    : plan === 'standard' ? '月980円 / 全件PRO'
      : plan === 'free' ? '無料' : '確認中';

function AccountDetails() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [billing, setBilling] = useState<BillingStatus>();

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!workerUrl) return;
      const token = await getToken();
      const response = await fetch(workerUrl + '/v1/billing/status', { headers: { Authorization: 'Bearer ' + token } });
      if (response.ok && active) setBilling(await response.json() as BillingStatus);
    })();
    return () => { active = false; };
  }, [getToken]);

  const portal = async () => {
    if (!workerUrl) return;
    const token = await getToken();
    const response = await fetch(workerUrl + '/v1/billing/portal', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    const body = await response.json().catch(() => null) as { url?: unknown } | null;
    if (response.ok && typeof body?.url === 'string') window.location.assign(body.url);
  };

  return <>
    <h1>アカウント</h1>
    <p>{user?.primaryEmailAddress?.emailAddress}</p>
    <dl>
      <div><dt>現在のプラン</dt><dd>{planLabel(billing?.plan)}</dd></div>
      <div><dt>契約状態</dt><dd>{billing?.subscriptionStatus ?? '契約なし'}</dd></div>
    </dl>
    {billing?.cancelAtPeriodEnd && <p>現在の契約期間の終了時に解約されます。</p>}
    {billing?.hasCustomer && <button onClick={() => { void portal(); }}>契約を管理</button>}
    <SignOutButton><button>ログアウト</button></SignOutButton>
  </>;
}

export function Account() {
  const { isLoaded } = useAuth();
  if (!isLoaded) return <section className="auth"><p>ログイン状態を確認しています。</p></section>;
  return <section className="auth">
    <Show when="signed-out">
      <h1>アカウント</h1>
      <p>ログインしなくても全ツールの通常版を無料で使えます。無料登録すると、よく使う3件を棚に保存できます。</p>
      <Link to="/login">ログイン / 新規登録</Link>
    </Show>
    <Show when="signed-in"><AccountDetails /></Show>
  </section>;
}
