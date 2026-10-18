import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'withholding-net',
  slug: 'withholding-net',
  name: '源泉徴収後の手取り逆算',
  shortDescription: '設定した源泉率と境界額から、欲しい手取りに必要な請求額を逆算。',
  route: '/tools/withholding-net',
  access: 'free',
  minimumPlan: 'free',
  category: '税・経費',
  order: 13,
  fields: fields([["desiredNet","欲しい手取り額","円","money"],["lowRate","低率部分の源泉率","%","percent"],["highRate","上限超部分の源泉率","%","percent"],["threshold","低率部分の上限額","円","money"]]),
  status: 'published',
  workerApi: false,
  notice: '対象報酬に適用される率・境界額を確認して入力してください。報酬の種類や消費税の扱いで実際の源泉額は変わります。',
} satisfies ToolDefinition<'withholding-net'>;
