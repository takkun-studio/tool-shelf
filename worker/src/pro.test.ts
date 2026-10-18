import { describe, expect, it } from 'vitest';
import type { Env } from './auth';
import { BASIC_PRO_LIMIT, canUsePro, parseToolIds, proState, saveBasicSelection } from './pro';

function fakeEnv() {
  const rows = new Map<string, { tool_ids_json: string; revision: number }>();
  const DB = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first() {
              if (sql.startsWith('SELECT tool_ids_json')) return rows.get(String(args[0])) ?? null;
              return null;
            },
            async run() {
              if (sql.startsWith('CREATE TABLE')) return { meta: { changes: 0 } };
              if (sql.startsWith('INSERT INTO pro_selections')) {
                const userId = String(args[0]);
                if (!rows.has(userId)) rows.set(userId, { tool_ids_json: '[]', revision: 0 });
                return { meta: { changes: 1 } };
              }
              if (sql.startsWith('UPDATE pro_selections')) {
                const [json, userIdRaw, expectedRevisionRaw] = args;
                const userId = String(userIdRaw);
                const expectedRevision = Number(expectedRevisionRaw);
                const current = rows.get(userId);
                if (!current || current.revision !== expectedRevision) return { meta: { changes: 0 } };
                rows.set(userId, { tool_ids_json: String(json), revision: current.revision + 1 });
                return { meta: { changes: 1 } };
              }
              throw new Error('Unexpected SQL: ' + sql);
            },
          };
        },
        async run() {
          if (sql.startsWith('CREATE TABLE')) return { meta: { changes: 0 } };
          throw new Error('Unexpected unbound SQL: ' + sql);
        },
      };
    },
  };
  return { env: { DB } as unknown as Env, rows };
}

describe('PRO selection validation', () => {
  it('accepts at most five distinct known tools', () => {
    expect(parseToolIds(['profit', 'market', 'inventory'])).toEqual(['profit', 'market', 'inventory']);
    expect(parseToolIds(['profit', 'breakeven', 'market', 'discount', 'payout'])).toHaveLength(BASIC_PRO_LIMIT);
  });

  it('rejects six tools, duplicates, unknown IDs, and forged shapes', () => {
    expect(parseToolIds(['profit', 'breakeven', 'market', 'discount', 'payout', 'service'])).toBeNull();
    expect(parseToolIds(['profit', 'profit'])).toBeNull();
    expect(parseToolIds(['profit', 'not-a-tool'])).toBeNull();
    expect(parseToolIds('profit')).toBeNull();
  });
});

describe('PRO selection persistence', () => {
  it('stores Basic selections per account and exposes only selected PRO tools', async () => {
    const { env } = fakeEnv();
    const first = await saveBasicSelection(env, 'user_1', 'basic', { toolIds: ['profit', 'inventory'], version: 0 });
    expect(first.status).toBe(200);
    expect(await canUsePro(env, 'user_1', 'basic', 'profit')).toBe(true);
    expect(await canUsePro(env, 'user_1', 'basic', 'market')).toBe(false);
    expect(await canUsePro(env, 'user_2', 'basic', 'profit')).toBe(false);
  });

  it('rejects stale concurrent updates instead of overwriting another device', async () => {
    const { env } = fakeEnv();
    expect((await saveBasicSelection(env, 'user_1', 'basic', { toolIds: ['profit'], version: 0 })).status).toBe(200);
    expect((await saveBasicSelection(env, 'user_1', 'basic', { toolIds: ['market'], version: 0 })).status).toBe(409);
    const state = await proState(env, 'user_1', 'basic');
    expect(state.selectedToolIds).toEqual(['profit']);
    expect(state.version).toBe(1);
  });

  it('does not let Free or Standard write a five-tool list', async () => {
    const { env } = fakeEnv();
    expect((await saveBasicSelection(env, 'user_1', 'free', { toolIds: ['profit'], version: 0 })).status).toBe(403);
    expect((await saveBasicSelection(env, 'user_1', 'standard', { toolIds: ['profit'], version: 0 })).status).toBe(403);
  });

  it('grants Standard all registered tools and Free none', async () => {
    const { env } = fakeEnv();
    expect(await canUsePro(env, 'user_1', 'standard', 'profit')).toBe(true);
    expect(await canUsePro(env, 'user_1', 'standard', 'investment')).toBe(true);
    expect(await canUsePro(env, 'user_1', 'standard', 'not-a-tool')).toBe(false);
    expect(await canUsePro(env, 'user_1', 'free', 'profit')).toBe(false);
  });
});
