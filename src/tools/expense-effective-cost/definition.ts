import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'expense-effective-cost',
  slug: 'expense-effective-cost',
  name: '経費にしたら実質いくら？',
  shortDescription: '事業利用分と想定限界税率から、実質負担を概算。',
  route: '/tools/expense-effective-cost',
  access: 'free',
  minimumPlan: 'free',
  category: '税・経費',
  order: 15,
  fields: fields([["purchase","購入額","円","money"],["businessRate","事業利用割合","%","percent"],["estimatedTaxRate","想定限界税率","%","percent"]]),
  status: 'published',
  workerApi: false,
  notice: '経費該当性や実際の税額は判定しません。事業利用割合と想定限界税率を自分で設定する概算です。',
} satisfies ToolDefinition<'expense-effective-cost'>;
