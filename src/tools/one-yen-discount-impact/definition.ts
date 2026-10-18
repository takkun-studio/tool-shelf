import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'one-yen-discount-impact',
  slug: 'one-yen-discount-impact',
  name: '1円値下げの破壊力',
  shortDescription: '小さな値下げが月利益をいくら削るか表示。',
  route: '/tools/one-yen-discount-impact',
  category: '販売',
  order: 40,
  fields: fields([["currentPrice","現在価格","円","money"],["monthlyQuantity","月間販売数","個","quantity"],["discountAmount","1個あたり値下げ額","円","money"]]),
  status: 'draft',
  proIdea: '1円・10円・100円など複数幅を即比較。',
  formulaNote: '値下げ額×販売数で月間利益減少を表示する。',
} satisfies DraftToolDefinition<'one-yen-discount-impact'>;
