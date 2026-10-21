import { describe, expect, it } from 'vitest';
import { hiddenTools } from './hidden';
import { toolModules, tools } from './index';

describe('tool folder registry', () => {
  it('publishes only the original ten tools', () => {
    expect(toolModules).toHaveLength(10);
    expect(tools).toHaveLength(10);
  });

  it('keeps the thirty implemented additions out of the public registry', () => {
    expect(hiddenTools).toHaveLength(30);
    const publicIds = new Set(tools.map((tool) => tool.id));
    for (const hidden of hiddenTools) expect(publicIds.has(hidden.id as never)).toBe(false);
  });

  it('has no duplicate IDs, routes, or order numbers across public and hidden tools', () => {
    const all = [...tools, ...hiddenTools];
    expect(new Set(all.map((tool) => tool.id)).size).toBe(all.length);
    expect(new Set(all.map((tool) => tool.route)).size).toBe(all.length);
    expect(new Set(all.map((tool) => tool.order)).size).toBe(all.length);
  });
});
