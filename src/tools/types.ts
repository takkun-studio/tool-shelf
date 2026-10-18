export type FieldUnit = '円' | '%' | '個' | '件' | '時間' | '日' | '月' | '回';
export type FieldKind = 'money' | 'percent' | 'quantity';
export type FieldOption = { value: number; label: string };

export type Field = {
  key: string;
  label: string;
  unit: FieldUnit;
  kind: FieldKind;
  allowDecimal?: boolean;
  options?: FieldOption[];
  defaultValue?: number;
};

export type ResultType = 'money' | 'percent' | 'quantity' | 'number';
export type ResultRow = {
  key: string;
  label: string;
  value: number | null;
  type?: ResultType;
  unit?: string;
};

export type CalculatorResult = {
  status?: string;
  summary?: string;
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
  notice?: string;
};

export type DraftToolDefinition<Id extends string = string> = Omit<ToolDefinition<Id>, 'access' | 'minimumPlan' | 'status' | 'workerApi'> & {
  status: 'draft';
  proIdea: string;
  formulaNote: string;
};

export type ToolModule<Id extends string = string> = {
  definition: ToolDefinition<Id>;
  calculate: (values: Record<string, number>) => CalculatorResult;
};

type FieldMeta = Pick<Field, 'allowDecimal' | 'options' | 'defaultValue'>;
export const fields = (items: [string, string, FieldUnit, FieldKind, Partial<FieldMeta>?][]): Field[] =>
  items.map(([key, label, unit, kind, meta]) => ({
    key,
    label,
    unit,
    kind,
    ...(kind === 'percent' ? { allowDecimal: true } : {}),
    ...meta,
  }));

export const money = (key: string, label: string, value: number | null): ResultRow =>
  ({ key, label, value, type: 'money' });

export const percent = (key: string, label: string, value: number | null): ResultRow =>
  ({ key, label, value, type: 'percent' });

export const quantity = (key: string, label: string, value: number | null, unit = '個'): ResultRow =>
  ({ key, label, value, type: 'quantity', unit });

export const numberResult = (key: string, label: string, value: number | null, unit?: string): ResultRow =>
  ({ key, label, value, type: 'number', unit });
