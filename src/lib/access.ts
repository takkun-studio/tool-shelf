import { tools, type ToolId } from './tools';
import { isPlan, type Plan } from './plans';
export const canAccessTool = (plan: unknown, toolId: unknown): boolean =>
  isPlan(plan) && typeof toolId === 'string' && tools.some((tool) => tool.id === toolId);
export const accessibleTools = (plan: unknown) => isPlan(plan) ? tools : [];
export const accessibleToolCount = (plan: unknown) => accessibleTools(plan).length;
export type { Plan, ToolId };
