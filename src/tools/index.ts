import { tool as profit } from './profit';
import { tool as breakeven } from './breakeven';
import { tool as market } from './market';
import { tool as discount } from './discount';
import { tool as payout } from './payout';
import { tool as service } from './service';
import { tool as target } from './target';
import { tool as inventory } from './inventory';
import { tool as channel } from './channel';
import { tool as investment } from './investment';

export type {
  CalculatorResult,
  DraftToolDefinition,
  Field,
  FieldKind,
  FieldOption,
  FieldUnit,
  ResultRow,
  ResultType,
  ToolDefinition,
  ToolModule,
} from './types';

export const toolModules = [
  profit,
  breakeven,
  market,
  discount,
  payout,
  service,
  target,
  inventory,
  channel,
  investment,
] as const;

export const tools = toolModules.map((module) => module.definition);
export type Tool = (typeof tools)[number];
export type ToolId = (typeof toolModules)[number]['definition']['id'];

export const isToolId = (value: string): value is ToolId =>
  toolModules.some((module) => module.definition.id === value);

export const toolById = (id: ToolId) => {
  const module = toolModules.find((candidate) => candidate.definition.id === id);
  if (!module) throw new Error(`Unknown tool: ${id}`);
  return module.definition;
};

export const calculate = (id: ToolId, values: Record<string, number>) => {
  const module = toolModules.find((candidate) => candidate.definition.id === id);
  if (!module) throw new Error(`Unknown tool: ${id}`);
  return module.calculate(values);
};

export const workerToolIds = tools.filter((tool) => tool.workerApi).map((tool) => tool.id);
