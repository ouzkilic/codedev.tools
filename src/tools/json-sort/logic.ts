import type { ToolLogic } from '@/hooks/useToolState';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

// Recursively sorts object keys alphabetically; arrays keep their order.
function sortValue(value: Json): Json {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<{ [k: string]: Json }>((acc, key) => {
        acc[key] = sortValue(value[key]);
        return acc;
      }, {});
  }
  return value;
}

export const jsonSortLogic: ToolLogic = {
  transform(input: string): string {
    return JSON.stringify(sortValue(JSON.parse(input)), null, 2);
  },
};
