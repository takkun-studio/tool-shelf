import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'clearance-cashout',
  slug: 'clearance-cashout',
  name: '売れ残り現金化ライン',
  shortDescription: '値下げで早く売り切る案と、現価格で待つ案の将来利益を比較。',
  route: '/tools/clearance-cashout',
  access: 'free',
  minimumPlan: 'free',
  category: '在庫',
  order: 34,
  fields: fields([["unitCost","1個あたり原価","円","money"],["currentPrice","現在価格","円","money"],["stock","在庫数","個","quantity"],["monthlyHoldingCost","今後の月間保管コスト","円","money"],["currentSelloutMonths","現価格での売切り見込月数","月","quantity",{"allowDecimal":true}],["discountPrice","値下げ後価格","円","money"],["discountSelloutMonths","値下げ後の売切り見込月数","月","quantity",{"allowDecimal":true}]]),
  status: 'published',
  workerApi: false,
  notice: 'すでに発生した保管費は判断から外し、これから発生する保管費と売切り期間だけを比較します。',
} satisfies ToolDefinition<'clearance-cashout'>;
