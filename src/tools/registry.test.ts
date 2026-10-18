import { describe, expect, it } from 'vitest';
import { draftTools } from './drafts';
import { toolModules, tools } from './index';

describe('tool folder registry', () => {
  it('publishes all forty reviewed tools', () => {
    expect(toolModules).toHaveLength(40);
    expect(tools).toHaveLength(40);
    expect(tools.every((tool) => tool.status === 'published')).toBe(true);
  });

  it('has no remaining draft tools', () => {
    expect(draftTools).toHaveLength(0);
  });

  it('has no duplicate IDs, routes, or order numbers', () => {
    expect(new Set(tools.map((tool) => tool.id)).size).toBe(tools.length);
    expect(new Set(tools.map((tool) => tool.route)).size).toBe(tools.length);
    expect(new Set(tools.map((tool) => tool.order)).size).toBe(tools.length);
  });
});
