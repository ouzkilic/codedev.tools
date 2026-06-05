import { diffLines, type Change } from 'diff';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

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

// Pretty-prints with sorted keys so formatting and key order don't show as differences.
export function normalizeJson(text: string): string {
  return JSON.stringify(sortValue(JSON.parse(text)), null, 2);
}

export function computeJsonDiff(left: string, right: string): Change[] {
  return diffLines(`${normalizeJson(left)}\n`, `${normalizeJson(right)}\n`);
}
