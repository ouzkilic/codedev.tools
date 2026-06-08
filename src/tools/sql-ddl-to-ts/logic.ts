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
    case 'bigint':
    case 'serial':
    case 'numeric':
    case 'decimal':
    case 'real':
    case 'float':
    case 'double':
    case 'money':
      return 'number';
    case 'varchar':
    case 'char':
    case 'text':
    case 'uuid':
    case 'citext':
      return 'string';
    case 'bool':
    case 'boolean':
      return 'boolean';
    case 'date':
    case 'time':
    case 'timestamp':
    case 'timestamptz':
    case 'datetime':
      return 'string';
    case 'json':
    case 'jsonb':
      return 'unknown';
    default:
      return 'unknown';
  }
}

export const sqlDdlToTsLogic: ToolLogic = {
  transform(input: string): string {
    const match = input.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([^\s(]+)\s*\(([\s\S]*)\)/i);
    if (!match) throw new Error('No CREATE TABLE statement found.');

    const tableName = stripIdentifier(match[1]);
    const interfaceName = pascalCase(tableName);

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

      const tsType = mapType(sqlType);
      const required = /\bnot\s+null\b/i.test(trimmed);
      lines.push(`  ${colName}${required ? '' : '?'}: ${tsType};`);
    }

    return `export interface ${interfaceName} {\n${lines.join('\n')}\n}`;
  },
};
