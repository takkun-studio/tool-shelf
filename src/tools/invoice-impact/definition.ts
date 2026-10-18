import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'invoice-impact',
  slug: 'invoice-impact',
  name: 'インボイス影響ざっくり計算',
  shortDescription: '対象仕入の税込額と控除できる割合から、控除差額を概算。',
  route: '/tools/invoice-impact',
  access: 'free',
  minimumPlan: 'free',
  category: '税・経費',
  order: 18,
  fields: fields([["purchaseTaxIncluded","対象仕入額（税込）","円","money"],["taxRate","消費税率","%","percent"],["creditRate","仕入税額控除できる割合","%","percent"]]),
  status: 'published',
  workerApi: false,
  notice: '正式な消費税申告計算ではありません。対象仕入額・税率・仕入税額控除できる割合を確認して入力してください。',
} satisfies ToolDefinition<'invoice-impact'>;
