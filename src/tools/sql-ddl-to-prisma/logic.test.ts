import { describe, it, expect } from 'vitest';
import { sqlDdlToPrismaLogic } from './logic';

describe('sqlDdlToPrismaLogic', () => {
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
});
