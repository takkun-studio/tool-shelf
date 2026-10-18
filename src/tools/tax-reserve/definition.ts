import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'tax-reserve',
  slug: 'tax-reserve',
  name: '税金よけとく額計算',
  shortDescription: '利益から税金用に取り置く目安額を計算。',
  route: '/tools/tax-reserve',
  category: '税・経費',
  order: 11,
  fields: fields([["profit","利益","円","money"],["reserveRate","取り置き率","%","percent"]]),
  status: 'draft',
  proIdea: '月別履歴と年間取り置き累計。',
  formulaNote: '税率を制度値として固定せず、ユーザー設定の取り置き率で概算する。',
} satisfies DraftToolDefinition<'tax-reserve'>;
