import type { ToolLogic } from '@/hooks/useToolState';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

function isPlainObject(v: Json): v is { [k: string]: Json } {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// Deep-merges source into target. Nested objects merge recursively; arrays and
// primitives from source replace those in target.
function deepMerge(target: Json, source: Json): Json {
  if (isPlainObject(target) && isPlainObject(source)) {
    const out: { [k: string]: Json } = { ...target };
    for (const key of Object.keys(source)) {
      out[key] = key in target ? deepMerge(target[key], source[key]) : source[key];
    }
    return out;
  }
  return source;
}

export const jsonMergeLogic: ToolLogic = {
  secondary: {
    label: 'JSON to merge in (source)',
    placeholder: '{ "b": 2 }',
  },
  transform(input: string, ctx): string {
    const target = JSON.parse(input);
    const sourceText = ctx?.secondary?.trim();
    if (!sourceText) return JSON.stringify(target, null, 2);
    const source = JSON.parse(sourceText);
    return JSON.stringify(deepMerge(target, source), null, 2);
  },
};
