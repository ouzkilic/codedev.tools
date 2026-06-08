import type { ToolLogic } from '@/hooks/useToolState';

interface Member {
  name: string;
  optional: boolean;
  type: string;
}

/** Split top-level members of an object body by ';'/newline, respecting nesting depth. */
function splitMembers(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of body) {
    if (ch === '{' || ch === '(' || ch === '<' || ch === '[') depth++;
    else if (ch === '}' || ch === ')' || ch === '>' || ch === ']') depth--;
    if ((ch === ';' || ch === '\n') && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Split a union type at top-level '|' (respecting nesting). */
function splitUnion(type: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of type) {
    if (ch === '{' || ch === '(' || ch === '<' || ch === '[') depth++;
    else if (ch === '}' || ch === ')' || ch === '>' || ch === ']') depth--;
    if (ch === '|' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current.trim());
  return parts;
}

function isStringLiteral(token: string): boolean {
  return /^(['"]).*\1$/.test(token);
}

function unquote(token: string): string {
  return token.slice(1, -1);
}

function mapType(rawType: string): string {
  const type = rawType.trim();

  // Inline object
  if (type.startsWith('{') && type.endsWith('}')) {
    return mapObject(type.slice(1, -1));
  }

  // Array via T[]
  if (type.endsWith('[]')) {
    return `z.array(${mapType(type.slice(0, -2))})`;
  }

  // Array<T>
  const arrayMatch = /^Array<(.+)>$/s.exec(type);
  if (arrayMatch) {
    return `z.array(${mapType(arrayMatch[1])})`;
  }

  // Union
  const unionParts = splitUnion(type);
  if (unionParts.length > 1) {
    if (unionParts.every(isStringLiteral)) {
      const values = unionParts.map((p) => `'${unquote(p)}'`).join(', ');
      return `z.enum([${values}])`;
    }
    return `z.union([${unionParts.map(mapType).join(', ')}])`;
  }

  switch (type) {
    case 'string':
      return 'z.string()';
    case 'number':
      return 'z.number()';
    case 'boolean':
      return 'z.boolean()';
    case 'any':
    case 'unknown':
      return 'z.unknown()';
    case 'null':
      return 'z.null()';
    default:
      if (isStringLiteral(type)) return `z.literal('${unquote(type)}')`;
      return 'z.unknown()';
  }
}

function parseMember(raw: string): Member {
  const colonIdx = raw.indexOf(':');
  if (colonIdx === -1) {
    throw new Error(`Invalid member (expected 'field: type'): ${raw}`);
  }
  let name = raw.slice(0, colonIdx).trim();
  const type = raw.slice(colonIdx + 1).trim();
  let optional = false;
  if (name.endsWith('?')) {
    optional = true;
    name = name.slice(0, -1).trim();
  }
  if (!name) throw new Error(`Invalid member name in: ${raw}`);
  return { name, optional, type };
}

function mapObject(body: string): string {
  const members = splitMembers(body);
  const lines = members.map((m) => {
    const member = parseMember(m);
    let expr = mapType(member.type);
    if (member.optional) expr += '.optional()';
    return `  ${member.name}: ${expr},`;
  });
  return `z.object({\n${lines.join('\n')}\n})`;
}

export const tsToZodLogic: ToolLogic = {
  transform(input: string): string {
    const src = input.trim();
    if (!src) throw new Error('Input is empty');

    // interface Name { ... }
    const ifaceMatch = /^(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)\s*\{([\s\S]*)\}$/.exec(src);
    // type Name = { ... }
    const typeMatch = /^(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=\s*\{([\s\S]*)\};?$/.exec(src);

    let name: string;
    let body: string;
    if (ifaceMatch) {
      name = ifaceMatch[1];
      body = ifaceMatch[2];
    } else if (typeMatch) {
      name = typeMatch[1];
      body = typeMatch[2];
    } else {
      throw new Error('Could not parse a TypeScript interface or type-object');
    }

    const objExpr = mapObject(body);
    return `import { z } from "zod";\n\nexport const ${name}Schema = ${objExpr};`;
  },
};
