import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'price-increase-impact',
  slug: 'price-increase-impact',
  name: '値上げしたらどうなる？',
  shortDescription: '値上げと販売数減少を組み合わせて月利益を比較。',
  route: '/tools/price-increase-impact',
  category: '販売',
  order: 25,
  fields: fields([["currentPrice","現在価格","円","money"],["newPrice","値上げ後価格","円","money"],["currentQuantity","現在月販数","個","quantity"],["decreaseRate","販売数減少予想","%","percent"],["unitCost","1個あたり原価","円","money"]]),
  status: 'draft',
  proIdea: '複数値上げ幅の感度分析。',
  formulaNote: '値上げ前後の売上・粗利・利益差を比較する。',
} satisfies DraftToolDefinition<'price-increase-impact'>;
