import { tools, type ToolId } from './tools'; import { isPlan, planRank, type Plan } from './plans';
export const canAccessTool=(plan:unknown,toolId:unknown):boolean=>{if(!isPlan(plan)||typeof toolId!=='string')return false;const tool=tools.find(item=>item.id===toolId);return !!tool&&planRank[plan]>=planRank[tool.minimumPlan]};
export const accessibleTools=(plan:unknown)=>isPlan(plan)?tools.filter(tool=>canAccessTool(plan,tool.id)):[];
export const accessibleToolCount=(plan:unknown)=>accessibleTools(plan).length;
export type { Plan, ToolId };
