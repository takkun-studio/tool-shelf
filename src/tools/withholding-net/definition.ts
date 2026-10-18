import { fields, type DraftToolDefinition } from '../types';

export const definition = {
  id: 'withholding-net',
  slug: 'withholding-net',
  name: '源泉徴収後の手取り逆算',
  shortDescription: '欲しい手取り額から請求額を逆算。',
  route: '/tools/withholding-net',
  category: '税・経費',
  order: 13,
  fields: fields([["desiredNet","欲しい手取り額","円","money"],["withholdingRate","源泉徴収率","%","percent"]]),
  status: 'draft',
  proIdea: '複数税率・複数案件の一括逆算。',
  formulaNote: '率はユーザー設定式。制度値をハードコードしない。',
} satisfies DraftToolDefinition<'withholding-net'>;
