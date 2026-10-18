export type FieldUnit = '円' | '%' | '個' | '件' | '時間' | '日' | '月' | '回';
export type FieldKind = 'money' | 'percent' | 'quantity';

export type Field = {
  key: string;
  label: string;
  unit: FieldUnit;
  kind: FieldKind;
};

export type ResultType = 'money' | 'percent' | 'quantity' | 'number';
export type ResultRow = {
  key: string;
  label: string;
  value: number | null;
  type?: ResultType;
};

export type CalculatorResult = {
  status?: string;
  rows: ResultRow[];
  loss?: boolean;
};

export type ToolDefinition<Id extends string = string> = {
  id: Id;
  slug: Id;
  name: string;
  shortDescription: string;
  route: `/tools/${Id}`;
  access: 'free';
  minimumPlan: 'free';
  category: string;
  order: number;
  fields: Field[];
  status: 'published';
  workerApi: boolean;
};

export type DraftToolDefinition<Id extends string = string> = {
  id: Id;
  slug: Id;
  name: string;
  shortDescription: string;
  route: `/tools/${Id}`;
  category: string;
  order: number;
  fields: Field[];
  status: 'draft';
  proIdea: string;
  formulaNote: string;
};

export type ToolModule<Id extends string = string> = {
  definition: ToolDefinition<Id>;
  calculate: (values: Record<string, number>) => CalculatorResult;
};

export const fields = (items: [string, string, FieldUnit, FieldKind][]): Field[] =>
  items.map(([key, label, unit, kind]) => ({ key, label, unit, kind }));

export const money = (key: string, label: string, value: number | null): ResultRow =>
  ({ key, label, value, type: 'money' });

export const percent = (key: string, label: string, value: number | null): ResultRow =>
  ({ key, label, value, type: 'percent' });

export const quantity = (key: string, label: string, value: number | null): ResultRow =>
  ({ key, label, value, type: 'quantity' });

export const numberResult = (key: string, label: string, value: number | null): ResultRow =>
  ({ key, label, value, type: 'number' });
