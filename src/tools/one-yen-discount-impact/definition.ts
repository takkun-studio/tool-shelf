import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'one-yen-discount-impact',
  slug: 'one-yen-discount-impact',
  name: '1円値下げの破壊力',
  shortDescription: '値下げ額と販売数から、手数料減少も含めた月利益への影響を計算。',
  route: '/tools/one-yen-discount-impact',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 40,
  fields: fields([["currentPrice","現在価格","円","money"],["monthlyQuantity","月間販売数","個","quantity"],["discountAmount","1個あたり値下げ額","円","money"],["feeRate","売価比例の手数料率","%","percent"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'one-yen-discount-impact'>;
