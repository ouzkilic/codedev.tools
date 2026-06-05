import { describe, it, expect } from 'vitest';
import { csvToSqlLogic } from './logic';

const run = (csv: string, table = 'users') =>
  csvToSqlLogic.transform(csv, { options: { table }, secondary: '' });

describe('csvToSql', () => {
  it('generates INSERT statements with quoted columns', () => {
    const out = run('name,age\nAda,36');
    expect(out).toBe('INSERT INTO users ("name", "age") VALUES (\'Ada\', 36);');
  });
  it('quotes strings and leaves numbers unquoted', () => {
    expect(run('id,label\n1,hello')).toContain("VALUES (1, 'hello');");
  });
  it('escapes single quotes', () => {
    expect(run("note\nit's fine")).toContain("'it''s fine'");
  });
  it('emits one statement per row', () => {
    expect(run('a\n1\n2\n3').split('\n')).toHaveLength(3);
  });
});
