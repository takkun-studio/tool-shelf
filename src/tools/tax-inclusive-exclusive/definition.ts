import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'tax-inclusive-exclusive',
  slug: 'tax-inclusive-exclusive',
  name: '税込・税抜まとめ変換',
  shortDescription: '金額を税込・税抜へ変換し、端数処理も選べます。',
  route: '/tools/tax-inclusive-exclusive',
  access: 'free',
  minimumPlan: 'free',
  category: '税・経費',
  order: 12,
  fields: fields([["amount","金額","円","money"],["taxRate","税率","%","percent"],["direction","変換方向","回","quantity",{"options":[{"value":0,"label":"税抜 → 税込"},{"value":1,"label":"税込 → 税抜"}]}],["rounding","端数処理","回","quantity",{"options":[{"value":0,"label":"四捨五入"},{"value":1,"label":"切り捨て"},{"value":2,"label":"切り上げ"}]}]]),
  status: 'published',
  workerApi: false,
  notice: '税率は固定せず入力式です。軽減税率など対象に合わせて設定してください。',
} satisfies ToolDefinition<'tax-inclusive-exclusive'>;
