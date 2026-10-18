import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'price-one-shot',
  slug: 'price-one-shot',
  name: '値付け一発診断',
  shortDescription: '原価・送料・手数料・税取り置き後に欲しい利益から売価を逆算。',
  route: '/tools/price-one-shot',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 21,
  fields: fields([["cost","原価","円","money"],["shipping","送料","円","money"],["feeRate","販売手数料率","%","percent"],["reserveRate","税取り置き率","%","percent"],["targetProfit","取り置き後に欲しい利益","円","money"]]),
  status: 'published',
  workerApi: false,
  notice: '税取り置き率は、販売利益に対して自分で確保したい割合として計算します。',
} satisfies ToolDefinition<'price-one-shot'>;
