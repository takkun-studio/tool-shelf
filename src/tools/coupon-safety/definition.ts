import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'coupon-safety',
  slug: 'coupon-safety',
  name: 'クーポン出して平気？',
  shortDescription: '値引き後も赤字にならないか確認。',
  route: '/tools/coupon-safety',
  category: '販売',
  order: 28,
  fields: fields([["price","通常価格","円","money"],["couponRate","クーポン率","%","percent"],["cost","原価","円","money"],["shipping","送料","円","money"],["feeRate","販売手数料率","%","percent"]]),
  status: 'draft',
  proIdea: 'クーポン率を複数並べて安全域を表示。',
  formulaNote: '値引き後価格から原価・送料・手数料を差し引き、赤字境界を出す。',
} satisfies DraftToolDefinition<'coupon-safety'>;
