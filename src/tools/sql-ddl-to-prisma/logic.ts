import type { ToolLogic } from '@/hooks/useToolState';

const CONSTRAINT_KEYWORDS = ['PRIMARY', 'FOREIGN', 'UNIQUE', 'CONSTRAINT', 'CHECK', 'KEY'];

function stripIdentifier(raw: string): string {
  return raw.trim().replace(/^["`[\]]+|["`[\]]+$/g, '');
}

function pascalCase(s: string): string {
  return (
    s
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('') || 'Table'
  );
}

function splitTopLevel(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function mapType(sqlType: string): string {
  const base = sqlType.toLowerCase().replace(/\s*\(.*$/, '').trim();
  switch (base) {
    case 'int':
    case 'integer':
    case 'smallint':
    case 'serial':
    case 'bigint':
      return 'Int';
    case 'numeric':
    case 'decimal':
    case 'real':
    case 'float':
    case 'double':
      return 'Float';
    case 'bool':
    case 'boolean':
      return 'Boolean';
    case 'date':
    case 'time':
    case 'timestamp':
    case 'timestamptz':
    case 'datetime':
      return 'DateTime';
    case 'json':
    case 'jsonb':
      return 'Json';
    case 'uuid':
    case 'varchar':
    case 'char':
    case 'text':
    case 'citext':
      return 'String';
    default:
      return 'String';
  }
}

export const sqlDdlToPrismaLogic: ToolLogic = {
  transform(input: string): string {
    const match = input.match(
      /create\s+table\s+(?:if\s+not\s+exists\s+)?([^\s(]+)\s*\(([\s\S]*)\)/i,
    );
    if (!match) throw new Error('No CREATE TABLE statement found.');

    const tableName = stripIdentifier(match[1]);
    const modelName = pascalCase(tableName);

    const lines: string[] = [];
    for (const part of splitTopLevel(match[2])) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const firstWord = stripIdentifier(trimmed.split(/\s+/)[0]).toUpperCase();
      if (CONSTRAINT_KEYWORDS.includes(firstWord)) continue;

      const tokens = trimmed.split(/\s+/);
      const colName = stripIdentifier(tokens[0]);
      const sqlType = tokens[1] ?? '';
      if (!colName || !sqlType) continue;

      const prismaType = mapType(sqlType);
      const isPrimary = /\bprimary\s+key\b/i.test(trimmed);
      const required = isPrimary || /\bnot\s+null\b/i.test(trimmed);
      const suffix = isPrimary ? ' @id' : '';
      lines.push(`  ${colName} ${prismaType}${required ? '' : '?'}${suffix}`);
    }

    if (lines.length === 0) throw new Error('No columns found in CREATE TABLE statement.');

    return `model ${modelName} {\n${lines.join('\n')}\n}`;
  },
};
