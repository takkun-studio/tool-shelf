import type { Env } from './auth';
import type { BackendPlan } from './policy';
import { tools, type ToolId } from '../../src/lib/tools';

export const BASIC_PRO_LIMIT = 5;
const knownToolIds = new Set<string>(tools.map((tool) => tool.id));

type SelectionRow = { tool_ids_json: string; revision: number };
export type ProState = { selectedToolIds: ToolId[]; version: number; allPro: boolean; limit: number | null };

const tableSql = `
CREATE TABLE IF NOT EXISTS pro_selections (
  clerk_user_id TEXT PRIMARY KEY,
  tool_ids_json TEXT NOT NULL DEFAULT '[]',
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id)
)`;

export async function ensureProSelectionTable(env: Env) {
  await env.DB.prepare(tableSql).run();
}

export function parseToolIds(value: unknown): ToolId[] | null {
  if (!Array.isArray(value) || value.length > BASIC_PRO_LIMIT) return null;
  if (new Set(value).size !== value.length) return null;
  if (!value.every((id) => typeof id === 'string' && knownToolIds.has(id))) return null;
  return value as ToolId[];
}

async function readBasicSelection(env: Env, userId: string) {
  await ensureProSelectionTable(env);
  const row = await env.DB.prepare('SELECT tool_ids_json, revision FROM pro_selections WHERE clerk_user_id = ?')
    .bind(userId).first<SelectionRow>();
  if (!row) return { selectedToolIds: [] as ToolId[], version: 0 };
  let parsed: unknown;
  try { parsed = JSON.parse(row.tool_ids_json); } catch { throw new Error('invalid_pro_selection'); }
  const selectedToolIds = parseToolIds(parsed);
  if (!selectedToolIds || !Number.isSafeInteger(row.revision) || row.revision < 0) throw new Error('invalid_pro_selection');
  return { selectedToolIds, version: row.revision };
}

export async function proState(env: Env, userId: string, plan: BackendPlan): Promise<ProState> {
  if (plan === 'standard') return { selectedToolIds: [], version: 0, allPro: true, limit: null };
  if (plan === 'free') return { selectedToolIds: [], version: 0, allPro: false, limit: 0 };
  const current = await readBasicSelection(env, userId);
  return { ...current, allPro: false, limit: BASIC_PRO_LIMIT };
}

export async function saveBasicSelection(
  env: Env,
  userId: string,
  plan: BackendPlan,
  value: unknown,
): Promise<{ status: 200 | 400 | 403 | 409; body: Record<string, unknown> }> {
  if (plan !== 'basic') return { status: 403, body: { error: 'この操作は月480円プラン専用です' } };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { status: 400, body: { error: '送信内容が不正です' } };
  const body = value as Record<string, unknown>;
  const toolIds = parseToolIds(body.toolIds);
  if (!toolIds || typeof body.version !== 'number' || !Number.isSafeInteger(body.version) || body.version < 0) {
    return { status: 400, body: { error: 'PRO対象は5件以内・重複なしで指定してください' } };
  }

  await ensureProSelectionTable(env);
  await env.DB.prepare("INSERT INTO pro_selections (clerk_user_id, tool_ids_json, revision) VALUES (?, '[]', 0) ON CONFLICT(clerk_user_id) DO NOTHING")
    .bind(userId).run();
  const updated = await env.DB.prepare(
    'UPDATE pro_selections SET tool_ids_json = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE clerk_user_id = ? AND revision = ?',
  ).bind(JSON.stringify(toolIds), userId, body.version).run();

  if (updated.meta.changes !== 1) {
    return { status: 409, body: { error: '別の画面で変更されています。最新状態を読み直してください' } };
  }
  return { status: 200, body: { selectedToolIds: toolIds, version: body.version + 1, allPro: false, limit: BASIC_PRO_LIMIT } };
}

export async function canUsePro(env: Env, userId: string, plan: BackendPlan, toolId: string): Promise<boolean> {
  if (!knownToolIds.has(toolId)) return false;
  if (plan === 'standard') return true;
  if (plan !== 'basic') return false;
  const current = await readBasicSelection(env, userId);
  return current.selectedToolIds.includes(toolId);
}
