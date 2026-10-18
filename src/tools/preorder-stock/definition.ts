import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'preorder-stock',
  slug: 'preorder-stock',
  name: '予約販売して足りる？',
  shortDescription: '予約数・不良率・予備率から、必要発注数を不足しない式で計算。',
  route: '/tools/preorder-stock',
  access: 'free',
  minimumPlan: 'free',
  category: '在庫',
  order: 29,
  fields: fields([["reservations","予約数","個","quantity"],["defectRate","不良見込み率","%","percent"],["bufferRate","予備率","%","percent"]]),
  status: 'published',
  workerApi: false,
  
} satisfies ToolDefinition<'preorder-stock'>;
