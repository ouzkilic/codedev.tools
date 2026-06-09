import { describe, it, expect } from 'vitest';
import { sqlDdlToPrismaLogic } from './logic';

describe('sqlDdlToPrismaLogic', () => {
  // --- existing assertions preserved ---
  it('converts a basic CREATE TABLE into a Prisma model', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50), active BOOLEAN)',
    );
    expect(out).toContain('model Users {');
    expect(out).toContain('id Int @id');
    expect(out).toContain('name String?');
    expect(out).toContain('active Boolean?');
  });

  it('maps types and marks NOT NULL columns as required', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE events (created_at TIMESTAMP NOT NULL, amount DECIMAL(10,2), meta JSONB)',
    );
    expect(out).toContain('created_at DateTime');
    expect(out).not.toContain('created_at DateTime?');
    expect(out).toContain('amount Float?');
    expect(out).toContain('meta Json?');
  });

  it('skips standalone constraint lines', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE orders (id UUID, user_id INT, PRIMARY KEY (id), FOREIGN KEY (user_id) REFERENCES users(id))',
    );
    expect(out).toContain('id String?');
    expect(out).toContain('user_id Int?');
    expect(out).not.toContain('PRIMARY String');
    expect(out).not.toContain('FOREIGN');
  });

  it('falls back to String for unknown types', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (col GEOMETRY)');
    expect(out).toContain('col String?');
  });

  it('throws when no CREATE TABLE statement is present', () => {
    expect(() => sqlDdlToPrismaLogic.transform('SELECT * FROM users')).toThrow(
      'No CREATE TABLE statement found.',
    );
  });

  // --- output structure ---
  it('wraps the model with the expected braces and trailing newline-brace', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (id INT)');
    expect(out.startsWith('model T {\n')).toBe(true);
    expect(out.endsWith('\n}')).toBe(true);
    expect(out).toBe('model T {\n  id Int?\n}');
  });

  it('indents every field line with two spaces', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (a INT, b TEXT)');
    const fieldLines = out.split('\n').slice(1, -1);
    expect(fieldLines).toHaveLength(2);
    for (const line of fieldLines) {
      expect(line.startsWith('  ')).toBe(true);
    }
  });

  // --- pascalCase model naming ---
  it('pascal-cases snake_case table names', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE order_items (id INT)');
    expect(out).toContain('model OrderItems {');
  });

  it('pascal-cases names with multiple separators and digits', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE app--v2_user (id INT)');
    expect(out).toContain('model AppV2User {');
  });

  it('strips quoting characters from the table name before pascal-casing', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE "public_users" (id INT)');
    expect(out).toContain('model PublicUsers {');
  });

  it('strips backticks from a MySQL-style table name', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE `my_table` (id INT)');
    expect(out).toContain('model MyTable {');
  });

  // --- type mapping coverage ---
  it('maps all integer-family types to Int', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE t (a INT, b INTEGER, c SMALLINT, d SERIAL, e BIGINT)',
    );
    expect(out).toContain('a Int?');
    expect(out).toContain('b Int?');
    expect(out).toContain('c Int?');
    expect(out).toContain('d Int?');
    expect(out).toContain('e Int?');
  });

  it('maps all float-family types to Float', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE t (a NUMERIC, b DECIMAL, c REAL, d FLOAT, e DOUBLE)',
    );
    expect(out).toContain('a Float?');
    expect(out).toContain('b Float?');
    expect(out).toContain('c Float?');
    expect(out).toContain('d Float?');
    expect(out).toContain('e Float?');
  });

  it('maps bool and boolean to Boolean', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (a BOOL, b BOOLEAN)');
    expect(out).toContain('a Boolean?');
    expect(out).toContain('b Boolean?');
  });

  it('maps all date/time-family types to DateTime', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE t (a DATE, b TIME, c TIMESTAMP, d TIMESTAMPTZ, e DATETIME)',
    );
    expect(out).toContain('a DateTime?');
    expect(out).toContain('b DateTime?');
    expect(out).toContain('c DateTime?');
    expect(out).toContain('d DateTime?');
    expect(out).toContain('e DateTime?');
  });

  it('maps json and jsonb to Json', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (a JSON, b JSONB)');
    expect(out).toContain('a Json?');
    expect(out).toContain('b Json?');
  });

  it('maps string-family types to String', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE t (a UUID, b VARCHAR(10), c CHAR(2), d TEXT, e CITEXT)',
    );
    expect(out).toContain('a String?');
    expect(out).toContain('b String?');
    expect(out).toContain('c String?');
    expect(out).toContain('d String?');
    expect(out).toContain('e String?');
  });

  it('ignores type-parameter parentheses when mapping (depth handling)', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (price DECIMAL(10, 2) NOT NULL)');
    expect(out).toContain('price Float');
    expect(out).not.toContain('price Float?');
  });

  // --- nullability ---
  it('marks columns optional by default and required only when NOT NULL or PRIMARY KEY', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE t (id INT PRIMARY KEY, req TEXT NOT NULL, opt TEXT)',
    );
    expect(out).toContain('id Int @id');
    expect(out).not.toContain('id Int?');
    expect(out).toContain('req String');
    expect(out).not.toContain('req String?');
    expect(out).toContain('opt String?');
  });

  it('adds @id and required marker together for a primary key column', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (id BIGINT PRIMARY KEY)');
    expect(out).toContain('id Int @id');
    expect(out).not.toContain('@id?');
  });

  it('does not append @id for non-primary columns', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (name TEXT NOT NULL)');
    expect(out).not.toContain('@id');
  });

  // --- constraint line skipping ---
  it('skips lines starting with each constraint keyword', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE t (id INT, ' +
        'PRIMARY KEY (id), ' +
        'FOREIGN KEY (id) REFERENCES o(id), ' +
        'UNIQUE (id), ' +
        'CONSTRAINT chk CHECK (id > 0), ' +
        'CHECK (id <> 0), ' +
        'KEY idx (id))',
    );
    const fieldLines = out.split('\n').slice(1, -1);
    expect(fieldLines).toEqual(['  id Int?']);
  });

  it('does not skip a column whose name merely contains a constraint substring', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (primary_email TEXT)');
    expect(out).toContain('primary_email String?');
  });

  // --- IF NOT EXISTS / case insensitivity ---
  it('handles IF NOT EXISTS clause', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE IF NOT EXISTS widgets (id INT)',
    );
    expect(out).toContain('model Widgets {');
    expect(out).toContain('id Int?');
  });

  it('is case-insensitive for the create table keyword and type keywords', () => {
    const out = sqlDdlToPrismaLogic.transform('create table t (id int not null)');
    expect(out).toContain('model T {');
    expect(out).toContain('id Int');
    expect(out).not.toContain('id Int?');
  });

  // --- whitespace / formatting tolerance ---
  it('handles multi-line DDL with newlines and tabs', () => {
    const ddl = `CREATE TABLE accounts (
\tid SERIAL PRIMARY KEY,
\temail VARCHAR(255) NOT NULL,
\tbalance NUMERIC(12,2)
)`;
    const out = sqlDdlToPrismaLogic.transform(ddl);
    expect(out).toContain('model Accounts {');
    expect(out).toContain('id Int @id');
    expect(out).toContain('email String');
    expect(out).not.toContain('email String?');
    expect(out).toContain('balance Float?');
  });

  it('handles table name directly attached to the opening paren', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE users(id INT)');
    expect(out).toContain('model Users {');
    expect(out).toContain('id Int?');
  });

  it('ignores a trailing comma before the closing paren', () => {
    const out = sqlDdlToPrismaLogic.transform('CREATE TABLE t (a INT, b TEXT, )');
    const fieldLines = out.split('\n').slice(1, -1);
    expect(fieldLines).toEqual(['  a Int?', '  b String?']);
  });

  // --- error paths ---
  it('throws on empty input', () => {
    expect(() => sqlDdlToPrismaLogic.transform('')).toThrow(
      'No CREATE TABLE statement found.',
    );
  });

  it('throws on whitespace-only input', () => {
    expect(() => sqlDdlToPrismaLogic.transform('   \n\t  ')).toThrow(
      'No CREATE TABLE statement found.',
    );
  });

  it('throws when the statement has no parsable columns', () => {
    expect(() =>
      sqlDdlToPrismaLogic.transform('CREATE TABLE t (PRIMARY KEY (id))'),
    ).toThrow('No columns found in CREATE TABLE statement.');
  });

  it('throws when a CREATE TABLE has no closing paren / parens at all', () => {
    expect(() => sqlDdlToPrismaLogic.transform('CREATE TABLE t')).toThrow(
      'No CREATE TABLE statement found.',
    );
  });

  // --- determinism ---
  it('is deterministic for the same input', () => {
    const ddl = 'CREATE TABLE t (id INT PRIMARY KEY, name TEXT NOT NULL, tags JSONB)';
    const a = sqlDdlToPrismaLogic.transform(ddl);
    const b = sqlDdlToPrismaLogic.transform(ddl);
    expect(a).toBe(b);
  });

  // --- preserves column name casing / special identifiers ---
  it('preserves original column-name casing and strips column-name quoting', () => {
    const out = sqlDdlToPrismaLogic.transform(
      'CREATE TABLE t ("FirstName" TEXT, `lastName` TEXT)',
    );
    expect(out).toContain('FirstName String?');
    expect(out).toContain('lastName String?');
  });

  // --- large input ---
  it('handles a large number of columns', () => {
    const cols = Array.from({ length: 100 }, (_, i) => `c${i} INT`).join(', ');
    const out = sqlDdlToPrismaLogic.transform(`CREATE TABLE big (${cols})`);
    const fieldLines = out.split('\n').slice(1, -1);
    expect(fieldLines).toHaveLength(100);
    expect(fieldLines[0]).toBe('  c0 Int?');
    expect(fieldLines[99]).toBe('  c99 Int?');
  });
});
