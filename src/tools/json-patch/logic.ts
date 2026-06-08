import type { ToolLogic } from '@/hooks/useToolState';

type Json = unknown;

interface PatchOp {
  op: string;
  path: string;
  value?: Json;
  from?: string;
}

function unescapeToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

function parsePointer(path: string): string[] {
  if (path === '') return [];
  if (path[0] !== '/') throw new Error(`Invalid JSON Pointer: ${path}`);
  return path
    .substring(1)
    .split('/')
    .map(unescapeToken);
}

function isRecord(value: Json): value is Record<string, Json> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getValue(doc: Json, tokens: string[]): Json {
  let current: Json = doc;
  for (const token of tokens) {
    if (Array.isArray(current)) {
      const index = Number(token);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        throw new Error(`Invalid array index: ${token}`);
      }
      current = current[index];
    } else if (isRecord(current)) {
      if (!(token in current)) {
        throw new Error(`Path not found: ${token}`);
      }
      current = current[token];
    } else {
      throw new Error(`Cannot traverse into non-object at: ${token}`);
    }
  }
  return current;
}

function getParent(doc: Json, tokens: string[]): Json {
  return getValue(doc, tokens.slice(0, -1));
}

function addValue(doc: Json, tokens: string[], value: Json): Json {
  if (tokens.length === 0) return value;
  const parent = getParent(doc, tokens);
  const key = tokens[tokens.length - 1];
  if (Array.isArray(parent)) {
    if (key === '-') {
      parent.push(value);
      return doc;
    }
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index > parent.length) {
      throw new Error(`Invalid array index: ${key}`);
    }
    parent.splice(index, 0, value);
    return doc;
  }
  if (isRecord(parent)) {
    parent[key] = value;
    return doc;
  }
  throw new Error(`Cannot add to non-object at: ${key}`);
}

function removeValue(doc: Json, tokens: string[]): Json {
  if (tokens.length === 0) throw new Error('Cannot remove root');
  const parent = getParent(doc, tokens);
  const key = tokens[tokens.length - 1];
  if (Array.isArray(parent)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index >= parent.length) {
      throw new Error(`Invalid array index: ${key}`);
    }
    parent.splice(index, 1);
    return doc;
  }
  if (isRecord(parent)) {
    if (!(key in parent)) throw new Error(`Path not found: ${key}`);
    delete parent[key];
    return doc;
  }
  throw new Error(`Cannot remove from non-object at: ${key}`);
}

function replaceValue(doc: Json, tokens: string[], value: Json): Json {
  if (tokens.length === 0) return value;
  removeValue(doc, tokens);
  return addValue(doc, tokens, value);
}

function deepEqual(a: Json, b: Json): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function applyOp(doc: Json, op: PatchOp): Json {
  const tokens = parsePointer(op.path);
  switch (op.op) {
    case 'add':
      return addValue(doc, tokens, op.value);
    case 'remove':
      return removeValue(doc, tokens);
    case 'replace':
      return replaceValue(doc, tokens, op.value);
    case 'move': {
      if (op.from === undefined) throw new Error('move requires "from"');
      const fromTokens = parsePointer(op.from);
      const moved = getValue(doc, fromTokens);
      const next = removeValue(doc, fromTokens);
      return addValue(next, tokens, moved);
    }
    case 'copy': {
      if (op.from === undefined) throw new Error('copy requires "from"');
      const fromTokens = parsePointer(op.from);
      const copied = structuredClone(getValue(doc, fromTokens));
      return addValue(doc, tokens, copied);
    }
    case 'test': {
      const actual = getValue(doc, tokens);
      if (!deepEqual(actual, op.value ?? null)) {
        throw new Error(`Test failed at ${op.path}`);
      }
      return doc;
    }
    default:
      throw new Error(`Unsupported op: ${op.op}`);
  }
}

export const jsonPatchLogic: ToolLogic = {
  secondary: {
    label: 'JSON Patch (array of ops)',
    placeholder: '[{"op":"add","path":"/b","value":2}]',
  },
  transform(input, ctx) {
    let doc: Json;
    try {
      doc = JSON.parse(input);
    } catch (e) {
      throw new Error('Invalid JSON document', { cause: e });
    }
    let result = structuredClone(doc);
    const patchText = (ctx?.secondary ?? '').trim();
    if (patchText === '') return JSON.stringify(result, null, 2);
    let ops: Json;
    try {
      ops = JSON.parse(patchText);
    } catch (e) {
      throw new Error('Invalid JSON Patch', { cause: e });
    }
    if (!Array.isArray(ops)) {
      throw new Error('JSON Patch must be an array of operations');
    }
    for (const op of ops as PatchOp[]) {
      result = applyOp(result, op);
    }
    return JSON.stringify(result, null, 2);
  },
};
