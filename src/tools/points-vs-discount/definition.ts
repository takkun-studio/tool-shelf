import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'points-vs-discount',
  slug: 'points-vs-discount',
  name: 'ポイント還元 vs 値引き',
  shortDescription: '同じ還元率でも店側負担がどう違うか比較。',
  route: '/tools/points-vs-discount',
  category: '販売',
  order: 35,
  fields: fields([["price","販売価格","円","money"],["discountRate","値引率","%","percent"],["pointRate","ポイント還元率","%","percent"],["pointCostRate","ポイント利用時の店負担率","%","percent"]]),
  status: 'draft',
  proIdea: '複数率を一覧比較。',
  formulaNote: '値引き即時負担とポイント将来負担を別々に計算する。',
} satisfies DraftToolDefinition<'points-vs-discount'>;
