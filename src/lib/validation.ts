import type { Field } from './tools';
export type Inputs = Record<string, string>;
export type Validation = Record<string, string | undefined>;

const normalize = (value: string) => value
  .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
  .replace(/[．。]/g, '.')
  .replace(/[，,]/g, '')
  .trim();

export const validate = (fields: Field[], inputs: Inputs): Validation => Object.fromEntries(fields.map((field) => {
  const { key, label, kind } = field;
  const raw = normalize(inputs[key] ?? '');
  if (raw === '') return [key, `${label}を入力してください`];

  if (field.options) {
    const value = Number(raw);
    return [key, field.options.some((option) => option.value === value) ? undefined : '選択肢から選んでください'];
  }

  const decimal = field.allowDecimal === true;
  const validShape = decimal ? /^\d+(?:\.\d+)?$/.test(raw) : /^\d+$/.test(raw);
  const message = kind === 'percent'
    ? decimal ? '0〜100の数値で入力してください' : '0〜100の整数で入力してください'
    : decimal ? '0以上の数値で入力してください' : '0以上の整数で入力してください';
  if (!validShape) return [key, message];

  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || (!decimal && !Number.isSafeInteger(value)) || (kind === 'percent' && value > 100)) {
    return [key, message];
  }
  return [key, undefined];
}));

export const parsed = (inputs: Inputs): Record<string, number> =>
  Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, Number(normalize(value))]));

export const valid = (errors: Validation) => Object.values(errors).every((error) => !error);
