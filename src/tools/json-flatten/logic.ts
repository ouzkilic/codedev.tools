import type { ToolLogic } from '@/hooks/useToolState';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

// Flattens nested objects/arrays into a single-level map of path -> primitive.
// Objects use dot notation (a.b); arrays use bracket notation (a[0]).
function flatten(value: Json, prefix: string, out: Record<string, Json>): void {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      out[prefix] = [];
      return;
    }
    value.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out));
    return;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      out[prefix] = {};
      return;
    }
    for (const key of keys) {
      const path = prefix ? `${prefix}.${key}` : key;
      flatten(value[key], path, out);
    }
    return;
  }
  out[prefix] = value;
}

export const jsonFlattenLogic: ToolLogic = {
  transform(input: string): string {
    const parsed = JSON.parse(input);
    const out: Record<string, Json> = {};
    flatten(parsed, '', out);
    // A top-level primitive ends up under the empty key; surface it as "value".
    if ('' in out) {
      out.value = out[''];
      delete out[''];
    }
    return JSON.stringify(out, null, 2);
  },
};
