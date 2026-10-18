import { calculate } from './calculate';
import { definition } from './definition';
export const tool = { definition, calculate } as const;
export { calculate, definition };
