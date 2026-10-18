import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'channel',
  slug: 'channel',
  name: '販売チャネル比較計算',
  shortDescription: '2つの販売先の手取りと利益を並べて比較。',
  route: '/tools/channel',
  access: 'free',
  minimumPlan: 'free',
  category: '販売',
  order: 9,
  fields: fields([["priceA","チャネルA 販売価格","円","money"],["costA","チャネルA 商品原価","円","money"],["shippingA","チャネルA 送料","円","money"],["salesFeeA","チャネルA 販売手数料率","%","percent"],["paymentFeeA","チャネルA 決済手数料率","%","percent"],["priceB","チャネルB 販売価格","円","money"],["costB","チャネルB 商品原価","円","money"],["shippingB","チャネルB 送料","円","money"],["salesFeeB","チャネルB 販売手数料率","%","percent"],["paymentFeeB","チャネルB 決済手数料率","%","percent"]]),
  status: 'published',
  workerApi: true,
} satisfies ToolDefinition<'channel'>;
