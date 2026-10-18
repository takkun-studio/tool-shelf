import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'cash-cycle',
  slug: 'cash-cycle',
  name: '仕入れ→販売→再発注シミュレーター',
  shortDescription: '資金が何周するといくらになるかを見る。',
  route: '/tools/cash-cycle',
  category: '資金',
  order: 30,
  fields: fields([["startingCash","開始資金","円","money"],["purchasePerCycle","1周あたり仕入額","円","money"],["revenuePerCycle","1周あたり回収額","円","money"],["cycles","回転数","回","quantity"]]),
  status: 'draft',
  proIdea: '回転ごとの残高表と資金不足警告。',
  formulaNote: '各サイクルの仕入れ・回収を順番に反映して現金推移を出す。',
} satisfies DraftToolDefinition<'cash-cycle'>;
