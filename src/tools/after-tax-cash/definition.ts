import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'after-tax-cash',
  slug: 'after-tax-cash',
  name: '税取り置き後ほんまに残る額',
  shortDescription: '売上・経費・税取り置きを引いて、手元に残す額を表示。',
  route: '/tools/after-tax-cash',
  access: 'free',
  minimumPlan: 'free',
  category: '税・経費',
  order: 17,
  fields: fields([["sales","売上","円","money"],["expenses","経費","円","money"],["reserveRate","税金取り置き率","%","percent"]]),
  status: 'published',
  workerApi: false,
  notice: '正式な税引後所得ではなく、設定した取り置き率による資金管理用の概算です。',
} satisfies ToolDefinition<'after-tax-cash'>;
