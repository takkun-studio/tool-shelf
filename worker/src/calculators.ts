import { calculate, toolById, type CalculatorResult, type ToolId } from '../../src/tools';

export type BackendPlan = 'free' | 'basic' | 'standard';

export const paidToolIds = [
  'discount',
  'payout',
  'service',
  'target',
  'inventory',
  'channel',
  'investment',
] as const satisfies readonly ToolId[];

export type PaidToolId = (typeof paidToolIds)[number];

type Spec = {
  minimumPlan: Exclude<BackendPlan, 'free'>;
  keys: string[];
  percentKeys?: string[];
  calculate: (values: Record<string, number>) => CalculatorResult;
};

const legacyMinimumPlan: Record<PaidToolId, Exclude<BackendPlan, 'free'>> = {
  discount: 'basic',
  payout: 'basic',
  service: 'standard',
  target: 'standard',
  inventory: 'standard',
  channel: 'standard',
  investment: 'standard',
};

export const paidToolSpecs = Object.fromEntries(
  paidToolIds.map((id) => {
    const definition = toolById(id);
    return [id, {
      minimumPlan: legacyMinimumPlan[id],
      keys: definition.fields.map((field) => field.key),
      percentKeys: definition.fields.filter((field) => field.kind === 'percent').map((field) => field.key),
      calculate: (values: Record<string, number>) => calculate(id, values),
    }];
  }),
) as Record<PaidToolId, Spec>;

export const isPaidToolId = (value: string): value is PaidToolId =>
  (paidToolIds as readonly string[]).includes(value);

export const readPaidInputs = (toolId: PaidToolId, value: unknown): Record<string, number> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const definition = toolById(toolId);
  const values: Record<string, number> = {};

  for (const field of definition.fields) {
    const input = source[field.key];
    if (
      typeof input !== 'number' ||
      !Number.isSafeInteger(input) ||
      input < 0 ||
      (field.kind === 'percent' && input > 100)
    ) return null;
    values[field.key] = input;
  }
  return values;
};

export const calculatePaid = (toolId: PaidToolId, values: Record<string, number>) =>
  calculate(toolId, values);
