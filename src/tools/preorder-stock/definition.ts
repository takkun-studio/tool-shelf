import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'preorder-stock',
  slug: 'preorder-stock',
  name: '予約販売して足りる？',
  shortDescription: '予約数と不良・予備率から必要在庫数を出す。',
  route: '/tools/preorder-stock',
  category: '在庫',
  order: 29,
  fields: fields([["reservations","予約数","個","quantity"],["defectRate","不良見込み率","%","percent"],["bufferRate","予備率","%","percent"]]),
  status: 'draft',
  proIdea: '複数商品の予約数をまとめて発注数へ変換。',
  formulaNote: '必要数=予約数に不良分と予備分を加味して切り上げる。',
} satisfies DraftToolDefinition<'preorder-stock'>;
