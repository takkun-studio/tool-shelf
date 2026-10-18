import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'expense-effective-cost',
  slug: 'expense-effective-cost',
  name: '経費にしたら実質いくら？',
  shortDescription: '経費化した場合の実質負担を概算。',
  route: '/tools/expense-effective-cost',
  category: '税・経費',
  order: 15,
  fields: fields([["purchase","購入額","円","money"],["estimatedTaxRate","想定税率","%","percent"]]),
  status: 'draft',
  proIdea: '複数候補を並べて比較。',
  formulaNote: '税負担軽減額を概算する教育用。経費該当性は判定しない。',
} satisfies DraftToolDefinition<'expense-effective-cost'>;
