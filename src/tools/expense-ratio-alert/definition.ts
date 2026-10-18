import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'expense-ratio-alert',
  slug: 'expense-ratio-alert',
  name: '経費使いすぎ警報',
  shortDescription: '売上に対する経費率を見える化。',
  route: '/tools/expense-ratio-alert',
  category: '税・経費',
  order: 19,
  fields: fields([["sales","売上","円","money"],["expenses","経費","円","money"]]),
  status: 'draft',
  proIdea: '費目別割合と過去月比較。',
  formulaNote: '経費率=経費÷売上。警報閾値はユーザー設定式にする。',
} satisfies DraftToolDefinition<'expense-ratio-alert'>;
