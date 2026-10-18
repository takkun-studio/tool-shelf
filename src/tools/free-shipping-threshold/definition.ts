import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'free-shipping-threshold',
  slug: 'free-shipping-threshold',
  name: '送料無料ライン決定',
  shortDescription: '送料を負担しても利益を残せる注文額を逆算。',
  route: '/tools/free-shipping-threshold',
  category: '販売',
  order: 27,
  fields: fields([["averageCostRate","平均原価率","%","percent"],["feeRate","販売手数料率","%","percent"],["shipping","平均送料","円","money"],["targetProfit","1注文あたり欲しい利益","円","money"]]),
  status: 'draft',
  proIdea: '複数配送方法ごとの送料無料ライン比較。',
  formulaNote: '粗利から送料と手数料を吸収できる最低注文額を逆算する。',
} satisfies DraftToolDefinition<'free-shipping-threshold'>;
