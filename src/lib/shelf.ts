import { tools, type ToolId } from './tools';
export type ShelfPlan = 'free' | 'basic' | 'standard';
export const shelfLimit: Record<ShelfPlan, number> = { free: 3, basic: 5, standard: 10 };
const knownIds = new Set<string>(tools.map((tool) => tool.id));
const keyFor = (userId: string) => `tool-shelf:v1:pins:${userId}`;
export function readShelf(userId: string): ToolId[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(keyFor(userId)) ?? '[]');
    if (!Array.isArray(stored)) return [];
    return [...new Set(stored.filter((id): id is ToolId => typeof id === 'string' && knownIds.has(id)))];
  } catch { return []; }
}
export function writeShelf(userId: string, ids: ToolId[]): boolean {
  try { localStorage.setItem(keyFor(userId), JSON.stringify(ids)); return true; }
  catch { return false; }
}
export function moveShelf(ids: ToolId[], id: ToolId, step: -1 | 1): ToolId[] {
  const index = ids.indexOf(id), target = index + step;
  if (index < 0 || target < 0 || target >= ids.length) return ids;
  const next = [...ids]; [next[index], next[target]] = [next[target], next[index]]; return next;
}
