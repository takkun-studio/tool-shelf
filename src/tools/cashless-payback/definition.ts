import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'cashless-payback',
  slug: 'cashless-payback',
  name: 'キャッシュレス、元取れる？',
  shortDescription: '決済手数料に対して必要な売上増を計算。',
  route: '/tools/cashless-payback',
  category: '決済',
  order: 36,
  fields: fields([["monthlySales","現在月商","円","money"],["feeRate","決済手数料率","%","percent"],["fixedCost","月額固定費","円","money"],["salesIncreaseRate","導入後売上増予想","%","percent"]]),
  status: 'draft',
  proIdea: '現金のみとの比較と損益分岐売上。',
  formulaNote: '増加粗利と決済コストを比較してペイ条件を出す。',
} satisfies DraftToolDefinition<'cashless-payback'>;
