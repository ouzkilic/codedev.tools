import { JSONPath } from 'jsonpath-plus';
import type { ToolLogic } from '@/hooks/useToolState';

export const jsonPathLogic: ToolLogic = {
  options: [
    {
      key: 'query',
      label: 'JSONPath',
      type: 'text',
      default: '$',
      placeholder: '$.store.book[*].author',
    },
  ],
  transform(input: string, ctx): string {
    const json = JSON.parse(input);
    const query = String(ctx?.options.query ?? '$').trim();
    if (!query) return '';
    const result = JSONPath({ path: query, json });
    return JSON.stringify(result, null, 2);
  },
};
