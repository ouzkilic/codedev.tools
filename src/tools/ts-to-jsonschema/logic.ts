import type { ToolLogic } from '@/hooks/useToolState';

type JsonSchema = {
  type?: string;
  items?: JsonSchema;
  enum?: string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
};

function mapType(raw: string): JsonSchema {
  const type = raw.trim();

  // string-literal union: 'a' | 'b' or "a" | "b"
  if (type.includes('|') && /['"]/.test(type)) {
    const parts = type
      .split('|')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const enumValues: string[] = [];
    for (const part of parts) {
      const m = /^'([^']*)'$|^"([^"]*)"$/.exec(part);
      if (!m) {
        throw new Error(`Unsupported union member: ${part}`);
      }
      enumValues.push(m[1] ?? m[2] ?? '');
    }
    return { enum: enumValues };
  }

  // inline object
  if (type.startsWith('{') && type.endsWith('}')) {
    return parseBody(type.slice(1, -1));
  }

  // Array<T>
  const arrayGeneric = /^Array<(.+)>$/.exec(type);
  if (arrayGeneric) {
    return { type: 'array', items: mapType(arrayGeneric[1]) };
  }

  // T[]
  if (type.endsWith('[]')) {
    return { type: 'array', items: mapType(type.slice(0, -2)) };
  }

  switch (type) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

/** Split member declarations on top-level separators (';' or newline), respecting nested braces/brackets. */
function splitMembers(body: string): string[] {
  const members: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of body) {
    if (ch === '{' || ch === '[' || ch === '<') depth++;
    else if (ch === '}' || ch === ']' || ch === '>') depth--;

    if ((ch === ';' || ch === ',' || ch === '\n') && depth === 0) {
      if (current.trim()) members.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) members.push(current.trim());
  return members;
}

function parseBody(body: string): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const member of splitMembers(body)) {
    const colon = splitTopLevelColon(member);
    if (colon < 0) {
      throw new Error(`Invalid member: ${member}`);
    }
    let name = member.slice(0, colon).trim();
    const typePart = member.slice(colon + 1).trim();
    const optional = name.endsWith('?');
    if (optional) name = name.slice(0, -1).trim();
    if (!name) {
      throw new Error(`Invalid member name in: ${member}`);
    }
    properties[name] = mapType(typePart);
    if (!optional) required.push(name);
  }

  return { type: 'object', properties, required };
}

function splitTopLevelColon(member: string): number {
  let depth = 0;
  for (let i = 0; i < member.length; i++) {
    const ch = member[i];
    if (ch === '{' || ch === '[' || ch === '<') depth++;
    else if (ch === '}' || ch === ']' || ch === '>') depth--;
    else if (ch === ':' && depth === 0) return i;
  }
  return -1;
}

export const tsToJsonSchemaLogic: ToolLogic = {
  transform(input: string): string {
    const match =
      /\binterface\s+\w+\s*({[\s\S]*})/.exec(input) ??
      /\btype\s+\w+\s*=\s*({[\s\S]*?})\s*;?\s*$/.exec(input);
    if (!match) {
      throw new Error('No TypeScript interface or type alias found.');
    }
    const objectText = match[1].trim();
    if (!objectText.startsWith('{') || !objectText.endsWith('}')) {
      throw new Error('Could not parse interface body.');
    }
    const body = objectText.slice(1, -1);
    const parsed = parseBody(body);

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: parsed.properties ?? {},
      required: parsed.required ?? [],
    };
    return JSON.stringify(schema, null, 2);
  },
};
