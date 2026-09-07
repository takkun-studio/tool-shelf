import type { Field } from './tools';
export type Inputs = Record<string, string>;
export type Validation = Record<string, string | undefined>;
const fullWidth = (value:string) => value.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
export const validate = (fields: Field[], inputs: Inputs): Validation => Object.fromEntries(fields.map(({key,label,kind}) => {
  const raw = fullWidth(inputs[key] ?? '');
  if (raw === '') return [key, `${label}を入力してください`];
  if (!/^\d+$/.test(raw)) return [key, kind === 'percent' ? '0〜100の整数で入力してください' : '0以上の整数で入力してください'];
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || (kind === 'percent' && value > 100)) return [key, kind === 'percent' ? '0〜100の整数で入力してください' : '0以上の整数で入力してください'];
  return [key, undefined];
}));
export const parsed = (inputs: Inputs): Record<string, number> => Object.fromEntries(Object.entries(inputs).map(([key,value]) => [key, Number(fullWidth(value))]));
export const valid = (errors: Validation) => Object.values(errors).every((error) => !error);
