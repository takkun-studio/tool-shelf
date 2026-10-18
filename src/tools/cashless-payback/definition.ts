import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'cashless-payback',
  slug: 'cashless-payback',
  name: 'キャッシュレス、元取れる？',
  shortDescription: '粗利率・決済比率まで含めて、導入後の売上増が決済コストを上回るか計算。',
  route: '/tools/cashless-payback',
  access: 'free',
  minimumPlan: 'free',
  category: '決済',
  order: 36,
  fields: fields([["monthlySales","現在月商","円","money"],["grossMarginRate","増加売上の粗利率","%","percent"],["feeRate","決済手数料率","%","percent"],["cashlessShare","導入後キャッシュレス比率","%","percent"],["fixedCost","月額固定費","円","money"],["salesIncreaseRate","導入後売上増予想","%","percent"]]),
  status: 'published',
  workerApi: false,
  notice: '導入前に同じ決済手数料が発生していない前提の簡易比較です。',
} satisfies ToolDefinition<'cashless-payback'>;
