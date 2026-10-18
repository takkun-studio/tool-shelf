import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'coupon-safety',
  slug: 'coupon-safety',
  name: 'クーポン出して平気？',
  shortDescription: 'クーポン値引き後の利益と、赤字にならない最大値引率を確認。',
  route: '/tools/coupon-safety',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 28,
  fields: fields([["price","通常価格","円","money"],["couponRate","クーポン率","%","percent"],["cost","原価","円","money"],["shipping","送料","円","money"],["feeRate","販売手数料率","%","percent"],["fixedFee","固定手数料","円","money"],["other","その他経費","円","money"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'coupon-safety'>;
