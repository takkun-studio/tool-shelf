import type { Env } from './auth';
import { tools, type ToolId } from '../../src/lib/tools';
import { calculate } from '../../src/lib/calculators';
import type { BackendPlan } from './policy';

const toolIds = new Set<string>(tools.map((tool) => tool.id));
export const allProToolIds = tools.map((tool) => tool.id);
export const PRO_BASIC_LIMIT = 5;
type SelectionRow = { tool_ids_json: string; revision: number };
export type ProSelections = { selectedToolIds: ToolId[]; version: number };

export function parseSelectionIds(value: unknown): ToolId[] | null {
  if (!Array.isArray(value) || value.length > PRO_BASIC_LIMIT || value.length !== new Set(value).size) return null;
  if (!value.every((id) => typeof id === 'string' && toolIds.has(id))) return null;
  return value as ToolId[];
}
export async function readProSelections(env: Env, userId: string): Promise<ProSelections> {
  const row = await env.DB.prepare('SELECT tool_ids_json, revision FROM pro_selections WHERE clerk_user_id = ?').bind(userId).first<SelectionRow>();
  if (!row) return { selectedToolIds: [], version: 0 };
  let value: unknown;
  try { value = JSON.parse(row.tool_ids_json); } catch { throw new Error('invalid_pro_selection_data'); }
  const selectedToolIds = parseSelectionIds(value);
  if (!selectedToolIds || !Number.isSafeInteger(row.revision) || row.revision < 0) throw new Error('invalid_pro_selection_data');
  return { selectedToolIds, version: row.revision };
}
export const canUsePro = (userId: string | null, plan: BackendPlan, toolId: string, selected: readonly string[]) =>
  !!userId && toolIds.has(toolId) && (plan === 'standard' || (plan === 'basic' && selected.includes(toolId)));

export async function writeProSelections(env: Env, userId: string, plan: BackendPlan, body: unknown): Promise<
  { code: 200 | 400 | 403 | 409; body: Record<string, unknown> }
> {
  if (plan !== 'basic') return { code: 403, body: { error: 'PRO枠の選択は月480円プラン専用です' } };
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { code: 400, body: { error: '送信内容が不正です' } };
  const request = body as Record<string, unknown>;
  const selectedToolIds = parseSelectionIds(request.toolIds);
  if (!selectedToolIds || typeof request.version !== 'number' || !Number.isSafeInteger(request.version) || request.version < 0) {
    return { code: 400, body: { error: '5件以内の異なるツールと正しい更新番号を指定してください' } };
  }
  // An empty row must exist for CAS; this INSERT never overwrites a previous selection.
  await env.DB.prepare("INSERT INTO pro_selections (clerk_user_id, tool_ids_json, revision) VALUES (?, '[]', 0) ON CONFLICT(clerk_user_id) DO NOTHING").bind(userId).run();
  const result = await env.DB.prepare('UPDATE pro_selections SET tool_ids_json = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE clerk_user_id = ? AND revision = ?')
    .bind(JSON.stringify(selectedToolIds), userId, request.version).run();
  if (result.meta.changes !== 1) return { code: 409, body: { error: '別の画面で変更されています。最新状態を読み込んでください' } };
  return { code: 200, body: { selectedToolIds, version: request.version + 1, limit: PRO_BASIC_LIMIT } };
}
export function parseComparisonInputs(id: string, value: unknown): Record<string, number> | null {
  const tool = tools.find((item) => item.id === id);
  if (!tool || !value || typeof value !== 'object' || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const parsed: Record<string, number> = {};
  for (const field of tool.fields) {
    const v = source[field.key];
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0 || (field.kind === 'percent' && v > 100)) return null;
    parsed[field.key] = v;
  }
  return parsed;
}
export function compareProInputs(toolId: string, a: unknown, b: unknown) {
  if (!toolIds.has(toolId)) return null;
  const left = parseComparisonInputs(toolId, a), right = parseComparisonInputs(toolId, b);
  if (!left || !right) return null;
  const current = calculate(toolId as ToolId, left);
  const alternative = calculate(toolId as ToolId, right);
  const differences = current.rows.map((row, index) => ({
    key: row.key, label: row.label, type: row.type,
    value: row.value === null || alternative.rows[index]?.value === null ? null : alternative.rows[index].value! - row.value,
  }));
  return { current, alternative, differences };
}
