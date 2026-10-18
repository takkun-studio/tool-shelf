import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'tax-reserve',
  slug: 'tax-reserve',
  name: '税金よけとく額計算',
  shortDescription: '利益から税金用に取り置く目安額を計算。',
  route: '/tools/tax-reserve',
  access: 'free',
  minimumPlan: 'free',
  category: '税・経費',
  order: 11,
  fields: fields([["profit","利益","円","money"],["reserveRate","取り置き率","%","percent"]]),
  status: 'published',
  workerApi: false,
  notice: '正式な税額計算ではありません。取り置き率は自分の状況に合わせて設定してください。',
} satisfies ToolDefinition<'tax-reserve'>;
