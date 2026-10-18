import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'fixed-asset-comparison',
  slug: 'fixed-asset-comparison',
  name: '固定資産ざっくり比較',
  shortDescription: '購入時の資金流出と、指定年数で割った費用イメージを並べる。',
  route: '/tools/fixed-asset-comparison',
  access: 'free',
  minimumPlan: 'free',
  category: '税・経費',
  order: 16,
  fields: fields([["purchase","購入額","円","money"],["businessRate","事業利用割合","%","percent"],["years","比較する年数","年","quantity"]]),
  status: 'published',
  workerApi: false,
  notice: '年割額は税務上の減価償却費ではありません。耐用年数・償却方法・特例は別途確認が必要です。',
} satisfies ToolDefinition<'fixed-asset-comparison'>;
