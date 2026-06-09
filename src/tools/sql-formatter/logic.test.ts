import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { sqlFormatterLogic } from './logic';

const run = (s: string, dialect = 'sql') =>
  sqlFormatterLogic.transform(s, { options: { dialect }, secondary: '' });

const fmt = (s: string) => run(s, 'sql');

describe('sqlFormatter — options metadata', () => {
  it('exposes a single dialect select option defaulting to sql', () => {
    expect(sqlFormatterLogic.options).toHaveLength(1);
    const opt = sqlFormatterLogic.options![0];
    expect(opt.key).toBe('dialect');
    expect(opt.type).toBe('select');
    expect(opt.default).toBe('sql');
  });

  it('offers all six supported dialects as choices', () => {
    const values = sqlFormatterLogic.options![0].choices!.map((c) => c.value);
    expect(values).toEqual(['sql', 'postgresql', 'mysql', 'sqlite', 'mariadb', 'bigquery']);
  });

  it('is a single-input tool (no secondary editor)', () => {
    expect(sqlFormatterLogic.secondary).toBeUndefined();
  });
});

describe('sqlFormatter — happy path', () => {
  it('uppercases keywords and indents a SELECT', () => {
    const out = fmt('select id, name from users where age > 18');
    expect(out).toContain('SELECT');
    expect(out).toContain('FROM');
    expect(out).toContain('WHERE');
  });

  it('puts each selected column on its own line', () => {
    const out = fmt('select a, b, c from t');
    expect(out).toBe('SELECT\n  a,\n  b,\n  c\nFROM\n  t');
    expect(out.split('\n').length).toBeGreaterThan(1);
  });

  it('formats an INSERT statement', () => {
    expect(fmt('insert into t (a,b) values (1,2)')).toBe(
      'INSERT INTO\n  t (a, b)\nVALUES\n  (1, 2)',
    );
  });

  it('formats an UPDATE statement', () => {
    expect(fmt('update t set a=1 where b=2')).toBe('UPDATE t\nSET\n  a = 1\nWHERE\n  b = 2');
  });

  it('formats a JOIN with ON clause', () => {
    expect(fmt('select * from a join b on a.id=b.id')).toBe(
      'SELECT\n  *\nFROM\n  a\n  JOIN b ON a.id = b.id',
    );
  });

  it('normalizes mixed-case keywords to upper but preserves identifier case', () => {
    expect(fmt('SeLeCt Id FrOm Users')).toBe('SELECT\n  Id\nFROM\n  Users');
  });

  it('uppercases keywords even when already lowercase single value', () => {
    expect(fmt('select 1')).toBe('SELECT\n  1');
  });
});

describe('sqlFormatter — dialects', () => {
  it('postgresql keeps double-quoted identifiers verbatim', () => {
    expect(run('select "Col" from t', 'postgresql')).toBe('SELECT\n  "Col"\nFROM\n  t');
  });

  it('mysql keeps backtick-quoted identifiers verbatim', () => {
    expect(run('select `col` from t', 'mysql')).toBe('SELECT\n  `col`\nFROM\n  t');
  });

  it('formats under sqlite dialect', () => {
    expect(run('select 1', 'sqlite')).toBe('SELECT\n  1');
  });

  it('formats under mariadb dialect', () => {
    expect(run('select 1', 'mariadb')).toBe('SELECT\n  1');
  });

  it('formats under bigquery dialect', () => {
    expect(run('select 1', 'bigquery')).toBe('SELECT\n  1');
  });

  it('falls back to sql when an unknown dialect is supplied', () => {
    expect(run('select 1', 'not-a-dialect')).toBe('SELECT\n  1');
  });

  it('falls back to sql when dialect option is missing', () => {
    const ctx: ToolContext = { options: {}, secondary: '' };
    expect(sqlFormatterLogic.transform('select 1', ctx)).toBe('SELECT\n  1');
  });

  it('falls back to sql when no context is provided at all', () => {
    expect(sqlFormatterLogic.transform('select 1')).toBe('SELECT\n  1');
  });
});

describe('sqlFormatter — edge cases', () => {
  it('returns empty string for empty input', () => {
    expect(fmt('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(fmt('   \n\t  ')).toBe('');
  });

  it('preserves unicode and emoji inside string literals', () => {
    expect(fmt("select 'çağ😀' as name from t")).toBe("SELECT\n  'çağ😀' AS name\nFROM\n  t");
  });

  it('handles negative, zero and decimal number literals', () => {
    expect(fmt('select -5, 0, 3.14 from t')).toBe('SELECT\n  -5,\n  0,\n  3.14\nFROM\n  t');
  });

  it('preserves line comments', () => {
    expect(fmt('select 1 -- hi\n from t')).toBe('SELECT\n  1 -- hi\nFROM\n  t');
  });

  it('separates multiple statements with blank lines and keeps semicolons', () => {
    expect(fmt('select 1; select 2;')).toBe('SELECT\n  1;\n\nSELECT\n  2;');
  });

  it('keeps a single trailing semicolon attached to the statement', () => {
    expect(fmt('select 1 ;')).toBe('SELECT\n  1;');
  });

  it('formats a very large SELECT without crashing', () => {
    const cols = Array.from({ length: 200 }, (_, i) => `c${i}`).join(',');
    const out = fmt(`select ${cols} from t`);
    expect(out.startsWith('SELECT')).toBe(true);
    expect(out).toContain('c199');
    // 200 columns + SELECT + FROM + t lines
    expect(out.split('\n').length).toBe(203);
  });
});

describe('sqlFormatter — error paths', () => {
  it('throws on unbalanced parentheses / parse error', () => {
    expect(() => fmt('SELECT FROM WHERE )))')).toThrow();
  });

  it('throws on unparseable garbage tokens', () => {
    expect(() => fmt('this is not sql ;;; @@@')).toThrow();
  });
});

describe('sqlFormatter — idempotency & determinism', () => {
  it('is idempotent: formatting already-formatted SQL yields the same output', () => {
    const once = fmt('select a,b from t');
    const twice = fmt(once);
    expect(twice).toBe(once);
  });

  it('is deterministic: same input produces identical output across calls', () => {
    const a = fmt('select id, name from users where age > 18');
    const b = fmt('select id, name from users where age > 18');
    expect(a).toBe(b);
  });
});
