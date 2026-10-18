import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'bonus-cost-alert',
  slug: 'bonus-cost-alert',
  name: 'おまけ付けすぎ警報',
  shortDescription: '袋・シール・サンプルなどの隠れ原価を合計。',
  route: '/tools/bonus-cost-alert',
  category: '販売',
  order: 33,
  fields: fields([["orders","注文数","件","quantity"],["bagCost","袋1件分","円","money"],["stickerCost","シール1件分","円","money"],["sampleCost","サンプル1件分","円","money"],["otherCost","その他1件分","円","money"]]),
  status: 'draft',
  proIdea: '商品ごとにおまけ構成を保存。',
  formulaNote: '1件あたり隠れ原価と月間総額を出す。',
} satisfies DraftToolDefinition<'bonus-cost-alert'>;
