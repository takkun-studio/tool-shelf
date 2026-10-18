import { describe, expect, it } from 'vitest';
import { allProToolIds, canUsePro, compareProInputs, parseSelectionIds, readProSelections, writeProSelections } from './pro';
import type { Env } from './auth';

function fakeDb() {
  const rows = new Map<string, { tool_ids_json: string; revision: number }>();
  const DB = { prepare: (sql: string) => {
    const stmt = (values: unknown[]) => ({
      first: async () => sql.startsWith('SELECT tool_ids_json') ? rows.get(String(values[0])) ?? null : null,
      run: async () => {
        const user = String(sql.startsWith('UPDATE') ? values[1] : values[0]);
        if (sql.startsWith('INSERT')) {
          if (!rows.has(user)) rows.set(user, { tool_ids_json: '[]', revision: 0 });
          return { meta: { changes: 1 } };
        }
        if (sql.startsWith('UPDATE')) {
          const row = rows.get(user);
          if (!row || row.revision !== values[2]) return { meta: { changes: 0 } };
          rows.set(user, { tool_ids_json: String(values[0]), revision: row.revision + 1 });
          return { meta: { changes: 1 } };
        }
        throw new Error('unexpected SQL');
      },
    });
    return { bind: (...values: unknown[]) => stmt(values) };
  } };
  return { rows, env: { DB } as unknown as Env };
}
const ids = ['profit', 'breakeven', 'market', 'discount', 'payout'] as const;

describe('PRO selection input validation and security', () => {
  it('accepts five or fewer distinct known tools', () => {
    expect(parseSelectionIds([...ids])).toEqual([...ids]);
    expect(parseSelectionIds([])).toEqual([]);
  });
  it('rejects six tools, duplicates, unknown strings and forged shapes', () => {
    expect(parseSelectionIds([...ids, 'service'])).toBe(null);
    expect(parseSelectionIds(['profit', 'profit'])).toBe(null);
    expect(parseSelectionIds(['not-real'])).toBe(null);
    expect(parseSelectionIds('profit')).toBe(null);
    expect(parseSelectionIds(null)).toBe(null);
  });
  it('rejects writes by Free or Standard; only Basic selects five', async () => {
    const { env } = fakeDb();
    expect((await writeProSelections(env, 'u1', 'free', { toolIds: ids, version: 0 })).code).toBe(403);
    expect((await writeProSelections(env, 'u1', 'standard', { toolIds: ids, version: 0 })).code).toBe(403);
    expect((await writeProSelections(env, 'u1', 'basic', { toolIds: [...ids, 'service'], version: 0 })).code).toBe(400);
    expect((await writeProSelections(env, 'u1', 'basic', { toolIds: ids, version: -1 })).code).toBe(400);
  });
  it('atomically swaps all five selections and rejects stale writes', async () => {
    const { env } = fakeDb();
    expect(await readProSelections(env, 'u1')).toEqual({ selectedToolIds: [], version: 0 });
    expect((await writeProSelections(env, 'u1', 'basic', { toolIds: ids, version: 0 })).code).toBe(200);
    const replacement = ['service', ...ids.slice(1)];
    const [success, conflict] = await Promise.all([
      writeProSelections(env, 'u1', 'basic', { toolIds: replacement, version: 1 }),
      writeProSelections(env, 'u1', 'basic', { toolIds: ['profit'], version: 1 }),
    ]);
    expect([success.code, conflict.code].sort()).toEqual([200, 409]);
    const saved = await readProSelections(env, 'u1');
    expect(saved.version).toBe(2);
    expect(saved.selectedToolIds).toEqual(replacement);
    expect(canUsePro('u1', 'basic', 'profit', saved.selectedToolIds)).toBe(false);
    expect(canUsePro('u1', 'basic', 'service', saved.selectedToolIds)).toBe(true);
  });
  it('isolates users', async () => {
    const { env } = fakeDb();
    await writeProSelections(env, 'u1', 'basic', { toolIds: ['profit'], version: 0 });
    expect((await readProSelections(env, 'u2')).selectedToolIds).toEqual([]);
  });
});

describe('PRO comparison engine', () => {
  it('uses the same source calculation for two actual profit scenarios', () => {
    const base = { price: 3000, cost: 1200, shipping: 300, feeRate: 0, fixedFee: 0, other: 0 };
    const result = compareProInputs('profit', base, { ...base, price: 3600 });
    expect(result?.current.rows.find(r => r.key === 'profit')?.value).toBe(1500);
    expect(result?.alternative.rows.find(r => r.key === 'profit')?.value).toBe(2100);
    expect(result?.differences.find(r => r.key === 'profit')?.value).toBe(600);
  });
  it('works across all 10 calculator definitions', () => {
    expect(allProToolIds).toHaveLength(10);
    expect(new Set(allProToolIds).size).toBe(10);
  });
  it('rejects invalid, forged or missing comparison inputs', () => {
    expect(compareProInputs('unknown', {}, {})).toBe(null);
    expect(compareProInputs('profit', {}, {})).toBe(null);
    expect(compareProInputs('profit', { price: -1 }, { price: -1 })).toBe(null);
  });
});
