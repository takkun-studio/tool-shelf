import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'ad-cost-units',
  slug: 'ad-cost-units',
  name: 'その広告、商品何個分？',
  shortDescription: '広告費を商品何個分の利益かに変換。',
  route: '/tools/ad-cost-units',
  category: '広告',
  order: 37,
  fields: fields([["adSpend","広告費","円","money"],["profitPerSale","1個あたり利益","円","money"]]),
  status: 'draft',
  proIdea: '広告別CPAと回収個数を比較。',
  formulaNote: '広告費÷1個あたり利益で必要販売数を出す。',
} satisfies DraftToolDefinition<'ad-cost-units'>;
