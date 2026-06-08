import type { ToolLogic } from '@/hooks/useToolState';

type JsonSchemaNode = {
  type?: string;
  items?: JsonSchemaNode;
  enum?: string[];
  properties?: Record<string, JsonSchemaNode>;
  required?: string[];
};

/** Find the matching close paren/bracket index for the open char at `open`. */
function matchDelimiter(src: string, open: number): number {
  const openCh = src[open];
  const closeCh = openCh === '(' ? ')' : openCh === '{' ? '}' : ']';
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) {
        if (ch !== closeCh) {
          throw new Error('Mismatched delimiters in Zod expression');
        }
        return i;
      }
    }
  }
  throw new Error('Unbalanced delimiters in Zod expression');
}

/** Split a comma-separated list at top nesting depth only. */
function splitTopLevel(src: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(src.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(src.slice(start));
  return parts.filter((p) => p.trim().length > 0);
}

function parseEnumValues(inner: string): string[] {
  return splitTopLevel(inner).map((raw) => {
    const v = raw.trim().replace(/^['"`]/, '').replace(/['"`]$/, '');
    return v;
  });
}

/** Parse a single Zod type expression into a JSON Schema node. */
function parseType(exprRaw: string): JsonSchemaNode {
  const expr = exprRaw.trim();
  if (!expr.startsWith('z.')) {
    throw new Error(`Expected a Zod type expression, got: ${expr}`);
  }

  if (expr.startsWith('z.string')) return { type: 'string' };
  if (expr.startsWith('z.number')) return { type: 'number' };
  if (expr.startsWith('z.boolean')) return { type: 'boolean' };

  if (expr.startsWith('z.array')) {
    const open = expr.indexOf('(');
    const close = matchDelimiter(expr, open);
    const inner = expr.slice(open + 1, close);
    return { type: 'array', items: parseType(inner) };
  }

  if (expr.startsWith('z.enum')) {
    const open = expr.indexOf('(');
    const close = matchDelimiter(expr, open);
    let inner = expr.slice(open + 1, close).trim();
    const lb = inner.indexOf('[');
    if (lb !== -1) {
      const rb = matchDelimiter(inner, lb);
      inner = inner.slice(lb + 1, rb);
    }
    return { enum: parseEnumValues(inner) };
  }

  if (expr.startsWith('z.object')) return parseObject(expr);

  throw new Error(`Unsupported Zod type: ${expr}`);
}

function parseObject(exprRaw: string): JsonSchemaNode {
  const expr = exprRaw.trim();
  const open = expr.indexOf('(');
  if (open === -1) throw new Error('Malformed z.object: missing "("');
  const close = matchDelimiter(expr, open);
  let body = expr.slice(open + 1, close).trim();

  const lb = body.indexOf('{');
  if (lb === -1) throw new Error('Malformed z.object: missing "{"');
  const rb = matchDelimiter(body, lb);
  body = body.slice(lb + 1, rb);

  const properties: Record<string, JsonSchemaNode> = {};
  const required: string[] = [];

  for (const field of splitTopLevel(body)) {
    const colon = field.indexOf(':');
    if (colon === -1) throw new Error(`Malformed field (missing ":"): ${field}`);
    const key = field
      .slice(0, colon)
      .trim()
      .replace(/^['"`]/, '')
      .replace(/['"`]$/, '');
    const valueExpr = field.slice(colon + 1).trim();
    const optional = /\.optional\(\s*\)/.test(valueExpr);
    properties[key] = parseType(valueExpr);
    if (!optional) required.push(key);
  }

  return { type: 'object', properties, required };
}

export const zodToJsonSchemaLogic: ToolLogic = {
  transform(input: string): string {
    const trimmed = input.trim();
    if (!trimmed.includes('z.object')) {
      throw new Error('Input must contain a z.object(...) schema.');
    }
    const start = trimmed.indexOf('z.object');
    let parsed: JsonSchemaNode;
    try {
      parsed = parseObject(trimmed.slice(start));
    } catch (e) {
      throw new Error(
        `Failed to parse Zod schema: ${e instanceof Error ? e.message : String(e)}`,
        { cause: e },
      );
    }

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: parsed.properties ?? {},
      required: parsed.required ?? [],
    };
    return JSON.stringify(schema, null, 2);
  },
};
