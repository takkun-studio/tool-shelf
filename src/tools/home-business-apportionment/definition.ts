import { fields, type ToolDefinition } from '../types';

export const definition = {
  id: 'home-business-apportionment',
  slug: 'home-business-apportionment',
  name: '家事按分（あんぶん）計算',
  shortDescription: '家賃・通信費などを事業利用割合で分ける。',
  route: '/tools/home-business-apportionment',
  access: 'free',
  minimumPlan: 'free',
  category: '税・経費',
  order: 14,
  fields: fields([["totalCost","支出総額","円","money"],["businessRate","事業利用割合","%","percent"]]),
  status: 'published',
  workerApi: false,
  notice: '事業利用割合は、使用時間・床面積など合理的な根拠で決めてください。',
} satisfies ToolDefinition<'home-business-apportionment'>;
