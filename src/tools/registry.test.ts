import { describe, expect, it } from 'vitest';
import { draftTools } from './drafts';
import { toolModules, tools } from './index';

describe('tool folder registry', () => {
  it('publishes only the ten completed tools', () => {
    expect(toolModules).toHaveLength(10);
    expect(tools).toHaveLength(10);
    expect(tools.every((tool) => tool.status === 'published')).toBe(true);
  });

  it('keeps all thirty future tools reserved but unpublished', () => {
    expect(draftTools).toHaveLength(30);
    expect(draftTools.every((tool) => tool.status === 'draft')).toBe(true);
  });

  it('has no duplicate IDs, routes, or order numbers across published and draft tools', () => {
    const all = [...tools, ...draftTools];
    expect(new Set(all.map((tool) => tool.id)).size).toBe(all.length);
    expect(new Set(all.map((tool) => tool.route)).size).toBe(all.length);
    expect(new Set(all.map((tool) => tool.order)).size).toBe(all.length);
  });

  it('keeps future tools out of production routes until their calculator is implemented', () => {
    const publishedIds = new Set(tools.map((tool) => tool.id));
    for (const draft of draftTools) expect(publishedIds.has(draft.id as never)).toBe(false);
  });
});
