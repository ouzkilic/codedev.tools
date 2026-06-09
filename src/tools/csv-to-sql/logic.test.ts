import { describe, it, expect } from 'vitest';
import { csvToSqlLogic } from './logic';

const run = (csv: string, table = 'users') =>
  csvToSqlLogic.transform(csv, { options: { table }, secondary: '' });

describe('csvToSql', () => {
  // --- existing assertions (kept) ---
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

  // --- table name option ---
  it('uses the provided table name', () => {
    expect(run('a\n1', 'products')).toBe('INSERT INTO products ("a") VALUES (1);');
  });
  it('trims whitespace around the table name', () => {
    expect(run('a\n1', '  orders  ')).toContain('INSERT INTO orders (');
  });
  it('falls back to my_table when the table option is empty', () => {
    expect(run('a\n1', '')).toContain('INSERT INTO my_table (');
  });
  it('falls back to my_table when the table option is whitespace only', () => {
    expect(run('a\n1', '   ')).toContain('INSERT INTO my_table (');
  });
  it('defaults to my_table when no options are passed', () => {
    expect(csvToSqlLogic.transform('a\n1')).toContain('INSERT INTO my_table (');
  });

  // --- type handling via dynamicTyping ---
  it('leaves integers unquoted', () => {
    expect(run('val\n42')).toBe('INSERT INTO users ("val") VALUES (42);');
  });
  it('leaves floats unquoted', () => {
    expect(run('val\n3.14')).toBe('INSERT INTO users ("val") VALUES (3.14);');
  });
  it('leaves negative numbers unquoted', () => {
    expect(run('val\n-5')).toBe('INSERT INTO users ("val") VALUES (-5);');
  });
  it('handles zero as an unquoted number', () => {
    expect(run('val\n0')).toBe('INSERT INTO users ("val") VALUES (0);');
  });
  it('renders booleans true/false unquoted', () => {
    expect(run('a,b\ntrue,false')).toBe(
      'INSERT INTO users ("a", "b") VALUES (true, false);',
    );
  });
  it('keeps the literal string NULL quoted (not a real null)', () => {
    expect(run('n\nNULL')).toBe('INSERT INTO users ("n") VALUES (\'NULL\');');
  });

  // --- null / empty value handling ---
  it('emits NULL for a missing trailing field', () => {
    expect(run('a,b\n1,')).toBe('INSERT INTO users ("a", "b") VALUES (1, NULL);');
  });
  it('emits NULL for a missing leading field', () => {
    expect(run('a,b\n,2')).toBe('INSERT INTO users ("a", "b") VALUES (NULL, 2);');
  });
  it('keeps whitespace-only string values quoted while empty becomes NULL', () => {
    expect(run('a,b\n  ,  ')).toBe('INSERT INTO users ("a", "b") VALUES (\'  \', NULL);');
  });

  // --- string / quoting edge cases ---
  it('preserves commas inside a quoted CSV field', () => {
    expect(run('q\n"a,b"')).toBe('INSERT INTO users ("q") VALUES (\'a,b\');');
  });
  it('escapes multiple single quotes in one value', () => {
    expect(run("x\n''''")).toContain("''''''''");
  });
  it('handles unicode values', () => {
    expect(run('city\nİstanbul')).toBe('INSERT INTO users ("city") VALUES (\'İstanbul\');');
  });
  it('handles emoji values', () => {
    expect(run('name\n😀rocket')).toContain("'😀rocket'");
  });

  // --- multiple rows / structure ---
  it('builds a statement per row with shared column list', () => {
    const out = run('name,age\nAda,36\nBob,40');
    expect(out.split('\n')).toEqual([
      'INSERT INTO users ("name", "age") VALUES (\'Ada\', 36);',
      'INSERT INTO users ("name", "age") VALUES (\'Bob\', 40);',
    ]);
  });
  it('skips blank lines between rows (skipEmptyLines)', () => {
    expect(run('a\n1\n\n2').split('\n')).toHaveLength(2);
  });
  it('is deterministic across repeated calls', () => {
    const csv = 'name,age\nAda,36\nBob,40';
    expect(run(csv)).toBe(run(csv));
  });
  it('handles a large input efficiently and emits one row per record', () => {
    const rows = Array.from({ length: 1000 }, (_, i) => `name${i},${i}`).join('\n');
    const out = run(`name,age\n${rows}`);
    const lines = out.split('\n');
    expect(lines).toHaveLength(1000);
    expect(lines[0]).toBe('INSERT INTO users ("name", "age") VALUES (\'name0\', 0);');
    expect(lines[999]).toBe('INSERT INTO users ("name", "age") VALUES (\'name999\', 999);');
  });

  // --- error paths ---
  it('throws when input is empty', () => {
    expect(() => run('')).toThrow('No data rows found.');
  });
  it('throws when input is whitespace only', () => {
    expect(() => run('   \n  ')).toThrow('No data rows found.');
  });
  it('throws when only a header row is present (no data)', () => {
    expect(() => run('a,b')).toThrow('No data rows found.');
  });
  it('throws on too many fields in a row (FieldMismatch)', () => {
    expect(() => run('a,b\n1,2,3')).toThrow(/Too many fields/);
  });
  it('throws on too few fields in a row (FieldMismatch)', () => {
    expect(() => run('a,b\n1')).toThrow(/Too few fields/);
  });
});
