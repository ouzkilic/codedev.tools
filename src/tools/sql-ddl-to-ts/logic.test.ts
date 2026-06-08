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
});
