import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'price-one-shot',
  slug: 'price-one-shot',
  name: '値付け一発診断',
  shortDescription: '原価・送料・手数料・税取り置き・欲しい利益から売価を逆算。',
  route: '/tools/price-one-shot',
  category: '販売',
  order: 21,
  fields: fields([["cost","原価","円","money"],["shipping","送料","円","money"],["feeRate","販売手数料率","%","percent"],["reserveRate","税取り置き率","%","percent"],["targetProfit","欲しい利益","円","money"]]),
  status: 'draft',
  proIdea: '複数販売先・複数利益目標を一括比較。',
  formulaNote: '手数料と取り置きを含めた売価の逆算式を実装する。',
} satisfies DraftToolDefinition<'price-one-shot'>;
