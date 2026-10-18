import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'home-business-apportionment',
  slug: 'home-business-apportionment',
  name: '家事按分（あんぶん）計算',
  shortDescription: '家賃・通信費などを事業利用割合で分ける。',
  route: '/tools/home-business-apportionment',
  category: '税・経費',
  order: 14,
  fields: fields([["totalCost","支出総額","円","money"],["businessRate","事業利用割合","%","percent"]]),
  status: 'draft',
  proIdea: '費目別の按分率保存と月次集計。',
  formulaNote: '事業分=支出総額×事業利用割合。税務判断そのものは行わない。',
} satisfies DraftToolDefinition<'home-business-apportionment'>;
