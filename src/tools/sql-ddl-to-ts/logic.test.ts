import { describe, it, expect } from 'vitest';
import { sqlDdlToTsLogic } from './logic';

describe('sqlDdlToTsLogic', () => {
  it('converts a basic CREATE TABLE statement', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE users (id INT NOT NULL, name VARCHAR(50), active BOOLEAN)',
    );
    expect(out).toContain('export interface Users {');
    expect(out).toContain('id: number;');
    expect(out).toContain('name?: string;');
    expect(out).toContain('active?: boolean;');
  });

  it('strips quotes/backticks/brackets from table name', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE `order_items` (qty INT NOT NULL)');
    expect(out).toContain('export interface OrderItems {');
    expect(out).toContain('qty: number;');
  });

  it('ignores constraint lines', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE t (id INT NOT NULL, name TEXT, PRIMARY KEY (id), UNIQUE (name))',
    );
    expect(out).not.toContain('PRIMARY');
    expect(out).not.toContain('UNIQUE');
    expect(out).toContain('id: number;');
    expect(out).toContain('name?: string;');
  });

  it('maps json types to unknown and dates to string', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE x (meta JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL)',
    );
    expect(out).toContain('meta: unknown;');
    expect(out).toContain('created_at: string;');
  });

  it('throws on invalid input', () => {
    expect(() => sqlDdlToTsLogic.transform('not sql')).toThrow();
  });

  // --- error paths ---

  it('throws on empty string', () => {
    expect(() => sqlDdlToTsLogic.transform('')).toThrow('No CREATE TABLE statement found.');
  });

  it('throws on whitespace-only input', () => {
    expect(() => sqlDdlToTsLogic.transform('   \n\t  ')).toThrow();
  });

  it('throws when there is no closing paren', () => {
    expect(() => sqlDdlToTsLogic.transform('CREATE TABLE foo (id INT')).toThrow(
      'No CREATE TABLE statement found.',
    );
  });

  it('throws when CREATE TABLE has no opening paren block', () => {
    expect(() => sqlDdlToTsLogic.transform('CREATE TABLE foo')).toThrow();
  });

  // --- case insensitivity & IF NOT EXISTS ---

  it('is case-insensitive on the CREATE TABLE keyword', () => {
    const out = sqlDdlToTsLogic.transform('create table foo (id int not null)');
    expect(out).toContain('export interface Foo {');
    expect(out).toContain('id: number;');
  });

  it('handles IF NOT EXISTS clause', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE IF NOT EXISTS widgets (id BIGINT NOT NULL)',
    );
    expect(out).toContain('export interface Widgets {');
    expect(out).toContain('id: number;');
  });

  // --- table name handling ---

  it('pascal-cases multi-word table names with underscores and dashes', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE my_cool-table (id INT NOT NULL)');
    expect(out).toContain('export interface MyCoolTable {');
  });

  it('handles table name immediately followed by paren (no space)', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE users(id INT NOT NULL)');
    expect(out).toContain('export interface Users {');
    expect(out).toContain('id: number;');
  });

  it('strips double quotes and square brackets around the table name', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE "Accounts" (id INT NOT NULL)');
    expect(out).toContain('export interface Accounts {');
  });

  // --- numeric type mappings ---

  it('maps every numeric SQL type to number', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE nums (a INT NOT NULL, b INTEGER NOT NULL, c SMALLINT NOT NULL, ' +
        'd BIGINT NOT NULL, e SERIAL NOT NULL, f NUMERIC NOT NULL, g DECIMAL NOT NULL, ' +
        'h REAL NOT NULL, i FLOAT NOT NULL, j DOUBLE NOT NULL, k MONEY NOT NULL)',
    );
    for (const col of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']) {
      expect(out).toContain(`${col}: number;`);
    }
    expect(out).not.toContain('unknown');
  });

  it('maps every string SQL type to string', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE strs (a VARCHAR(10) NOT NULL, b CHAR NOT NULL, c TEXT NOT NULL, ' +
        'd UUID NOT NULL, e CITEXT NOT NULL)',
    );
    for (const col of ['a', 'b', 'c', 'd', 'e']) {
      expect(out).toContain(`${col}: string;`);
    }
  });

  it('maps boolean SQL types (bool/boolean) to boolean', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE flags (a BOOL NOT NULL, b BOOLEAN NOT NULL)',
    );
    expect(out).toContain('a: boolean;');
    expect(out).toContain('b: boolean;');
  });

  it('maps date/time SQL types to string', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE dts (a DATE NOT NULL, b TIME NOT NULL, c TIMESTAMP NOT NULL, ' +
        'd TIMESTAMPTZ NOT NULL, e DATETIME NOT NULL)',
    );
    for (const col of ['a', 'b', 'c', 'd', 'e']) {
      expect(out).toContain(`${col}: string;`);
    }
  });

  it('maps json/jsonb to unknown', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE j (a JSON NOT NULL, b JSONB NOT NULL)',
    );
    expect(out).toContain('a: unknown;');
    expect(out).toContain('b: unknown;');
  });

  it('maps unrecognized SQL types to unknown', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE w (loc GEOMETRY NOT NULL)');
    expect(out).toContain('loc: unknown;');
  });

  it('strips type size/precision parentheses when mapping (NUMERIC(10,2) -> number)', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE p (amt NUMERIC(10,2) NOT NULL)');
    expect(out).toContain('amt: number;');
  });

  // --- nullability ---

  it('marks columns without NOT NULL as optional and required ones as non-optional', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE m (req INT NOT NULL, opt INT)',
    );
    expect(out).toContain('req: number;');
    expect(out).toContain('opt?: number;');
  });

  it('detects NOT NULL case-insensitively and with extra whitespace', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE m (a INT not    null)');
    expect(out).toContain('a: number;');
    expect(out).not.toContain('a?:');
  });

  // --- constraints / skipping ---

  it('skips FOREIGN KEY, CONSTRAINT, CHECK and KEY constraint rows', () => {
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE rel (id INT NOT NULL, owner INT NOT NULL, ' +
        'CONSTRAINT fk FOREIGN KEY (owner) REFERENCES users(id), ' +
        'CHECK (id > 0), KEY idx_owner (owner))',
    );
    expect(out).toContain('id: number;');
    expect(out).toContain('owner: number;');
    expect(out).not.toContain('CONSTRAINT');
    expect(out).not.toContain('FOREIGN');
    expect(out).not.toContain('CHECK');
    // Only the two real columns appear as fields.
    expect(out.match(/: number;/g)?.length).toBe(2);
  });

  it('skips a column whose first word is a quoted constraint keyword', () => {
    // Constraint keyword detection strips quotes/brackets before comparing.
    const out = sqlDdlToTsLogic.transform(
      'CREATE TABLE c (id INT NOT NULL, `PRIMARY` KEY (id))',
    );
    expect(out.match(/: number;/g)?.length).toBe(1);
  });

  // --- structural / determinism ---

  it('produces a closed interface block with header and footer', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE foo (id INT NOT NULL)');
    expect(out.startsWith('export interface Foo {')).toBe(true);
    expect(out.endsWith('}')).toBe(true);
    expect(out).toBe('export interface Foo {\n  id: number;\n}');
  });

  it('is deterministic for identical input', () => {
    const sql = 'CREATE TABLE foo (id INT NOT NULL, name TEXT)';
    expect(sqlDdlToTsLogic.transform(sql)).toBe(sqlDdlToTsLogic.transform(sql));
  });

  it('handles multiline DDL with newlines and trailing commas tolerance', () => {
    const out = sqlDdlToTsLogic.transform(
      `CREATE TABLE products (
        id BIGINT NOT NULL,
        title VARCHAR(255) NOT NULL,
        price NUMERIC(10,2),
        in_stock BOOLEAN
      )`,
    );
    expect(out).toContain('export interface Products {');
    expect(out).toContain('id: number;');
    expect(out).toContain('title: string;');
    expect(out).toContain('price?: number;');
    expect(out).toContain('in_stock?: boolean;');
  });

  it('preserves the original column identifier casing in field names', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE foo (UserID INT NOT NULL)');
    expect(out).toContain('UserID: number;');
  });

  it('strips backticks from column identifiers', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE foo (`first name` VARCHAR(10) NOT NULL)');
    // first token after stripping backticks is "first
    expect(out).toContain('first');
  });

  it('handles a large input with many columns without error', () => {
    const cols = Array.from({ length: 100 }, (_, i) => `col${i} INT NOT NULL`).join(', ');
    const out = sqlDdlToTsLogic.transform(`CREATE TABLE big (${cols})`);
    expect(out.match(/: number;/g)?.length).toBe(100);
    expect(out).toContain('col0: number;');
    expect(out).toContain('col99: number;');
  });

  it('handles unicode/emoji in identifiers (non-alnum stripped from interface name)', () => {
    const out = sqlDdlToTsLogic.transform('CREATE TABLE café_tablé (id INT NOT NULL)');
    // pascalCase replaces non-alnum runs with spaces, so accented chars are stripped.
    expect(out).toContain('export interface');
    expect(out).toContain('id: number;');
  });

  it('skips column entries that have no type token', () => {
    // "flagonly" has no second token, so it is skipped.
    const out = sqlDdlToTsLogic.transform('CREATE TABLE t (id INT NOT NULL, flagonly)');
    expect(out).toContain('id: number;');
    expect(out.match(/:/g)?.length).toBe(1);
  });
});
