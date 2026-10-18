import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'purchase-go-no-go',
  slug: 'purchase-go-no-go',
  name: 'この仕入れ、買ってええ？',
  shortDescription: '仕入総額・販売コスト・売切り期間・手元資金から採算をまとめる。',
  route: '/tools/purchase-go-no-go',
  access: 'free',
  minimumPlan: 'free',
  category: '仕入れ',
  order: 22,
  fields: fields([["purchaseCost","仕入総額","円","money"],["expectedSales","見込売上","円","money"],["feeRate","販売手数料率","%","percent"],["shippingTotal","送料合計","円","money"],["otherCosts","その他販売経費","円","money"],["expectedMonths","売り切り見込月数","月","quantity",{"allowDecimal":true}],["availableCash","現在使える資金","円","money"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'purchase-go-no-go'>;
