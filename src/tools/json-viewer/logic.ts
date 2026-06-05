// Pure helpers for the tree viewer (kept separate so they're unit-testable).

export type JsonValue =
  | null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

export function isContainer(value: JsonValue): value is JsonValue[] | { [k: string]: JsonValue } {
  return value !== null && typeof value === 'object';
}

/** Child entries of an object/array as [key, value] pairs. */
export function entriesOf(value: JsonValue): [string, JsonValue][] {
  if (Array.isArray(value)) return value.map((v, i) => [String(i), v]);
  if (isContainer(value)) return Object.entries(value);
  return [];
}

/** A short label for a container node, e.g. "{3}" or "[2]". */
export function summarize(value: JsonValue): string {
  if (Array.isArray(value)) return `[${value.length}]`;
  if (isContainer(value)) return `{${Object.keys(value).length}}`;
  return '';
}

/** Renders a leaf (non-container) value to a display string. */
export function formatLeaf(value: JsonValue): string {
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}
