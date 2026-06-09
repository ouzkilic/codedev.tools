import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { zodToTsLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };

describe('zodToTsLogic', () => {
  it('generates an interface with primitive and optional fields', () => {
    const out = zodToTsLogic.transform(
      'z.object({ id: z.number(), name: z.string().optional() })',
    );
    expect(out).toContain('export interface Schema {');
    expect(out).toContain('id: number;');
    expect(out).toContain('name?: string;');
  });

  it('maps z.array(z.string()) to string[]', () => {
    const out = zodToTsLogic.transform('z.object({ tags: z.array(z.string()) })');
    expect(out).toContain('tags: string[];');
  });

  it('maps z.enum to a union type', () => {
    const out = zodToTsLogic.transform("z.object({ role: z.enum(['admin', 'user']) })");
    expect(out).toContain("role: 'admin' | 'user';");
  });

  it('handles a prefixed declaration and nested objects', () => {
    const out = zodToTsLogic.transform(
      'export const UserSchema = z.object({ user: z.object({ active: z.boolean() }) })',
    );
    expect(out).toContain('user: {');
    expect(out).toContain('active: boolean;');
  });

  it('treats nullish fields as optional', () => {
    const out = zodToTsLogic.transform('z.object({ note: z.string().nullish() })');
    expect(out).toContain('note?: string;');
  });

  it('throws when no z.object is present', () => {
    expect(() => zodToTsLogic.transform('z.string()')).toThrow();
  });

  // --- primitives ---

  it('maps all three primitive scalar types', () => {
    const out = zodToTsLogic.transform(
      'z.object({ a: z.string(), b: z.number(), c: z.boolean() })',
    );
    expect(out).toContain('a: string;');
    expect(out).toContain('b: number;');
    expect(out).toContain('c: boolean;');
  });

  it('ignores the optional ToolContext argument (pure single-input tool)', () => {
    const withCtx = zodToTsLogic.transform('z.object({ id: z.number() })', ctx);
    const withoutCtx = zodToTsLogic.transform('z.object({ id: z.number() })');
    expect(withCtx).toBe(withoutCtx);
  });

  // --- enums ---

  it('supports double-quoted enum members', () => {
    const out = zodToTsLogic.transform('z.object({ r: z.enum(["a","b","c"]) })');
    expect(out).toContain("r: 'a' | 'b' | 'c';");
  });

  it('supports a single-member enum', () => {
    const out = zodToTsLogic.transform("z.object({ kind: z.enum(['only']) })");
    expect(out).toContain("kind: 'only';");
  });

  it('throws for an empty enum', () => {
    expect(() => zodToTsLogic.transform('z.object({ x: z.enum([]) })')).toThrow(
      /at least one value/,
    );
  });

  // --- arrays ---

  it('maps an array of numbers to number[]', () => {
    const out = zodToTsLogic.transform('z.object({ xs: z.array(z.number()) })');
    expect(out).toContain('xs: number[];');
  });

  it('maps an array of objects to an inline object array', () => {
    const out = zodToTsLogic.transform(
      'z.object({ items: z.array(z.object({ id: z.number() })) })',
    );
    expect(out).toContain('items: {');
    expect(out).toContain('id: number;');
    expect(out).toContain('}[];');
  });

  it('marks an array field optional when the modifier sits inside (regex matches anywhere)', () => {
    // stripModifiers scans the whole field value, so .optional() inside z.array(...)
    // still flags the field itself as optional.
    const out = zodToTsLogic.transform(
      'z.object({ xs: z.array(z.string().optional()) })',
    );
    expect(out).toContain('xs?: string[];');
  });

  it('treats a nullish array as an optional array', () => {
    const out = zodToTsLogic.transform('z.object({ xs: z.array(z.number()).nullish() })');
    expect(out).toContain('xs?: number[];');
  });

  // --- nesting ---

  it('renders deeply nested objects', () => {
    const out = zodToTsLogic.transform(
      'z.object({ a: z.object({ b: z.object({ c: z.string() }) }) })',
    );
    expect(out).toContain('a: {');
    expect(out).toContain('b: {');
    expect(out).toContain('c: string;');
  });

  // --- keys / unicode ---

  it('strips surrounding quotes from quoted keys', () => {
    const out = zodToTsLogic.transform("z.object({ 'first-name': z.string() })");
    expect(out).toContain('first-name: string;');
  });

  it('preserves unicode and emoji in keys', () => {
    const out = zodToTsLogic.transform('z.object({ "naïve😀": z.string() })');
    expect(out).toContain('naïve😀: string;');
  });

  // --- error paths ---

  it('throws on whitespace-only input', () => {
    expect(() => zodToTsLogic.transform('   ')).toThrow(/No z\.object/);
  });

  it('throws on empty input', () => {
    expect(() => zodToTsLogic.transform('')).toThrow(/No z\.object/);
  });

  it('throws for an empty z.object with no fields', () => {
    expect(() => zodToTsLogic.transform('z.object({})')).toThrow(/No fields/);
  });

  it('throws for an unsupported zod type', () => {
    expect(() => zodToTsLogic.transform('z.object({ d: z.date() })')).toThrow(
      /Unsupported Zod type/,
    );
  });

  it('throws with a parse error on unbalanced parentheses', () => {
    expect(() => zodToTsLogic.transform('z.object({ a: z.string()')).toThrow(
      /Failed to parse/,
    );
  });

  // --- scale / structure ---

  it('handles many fields and keeps them in order', () => {
    const fields = Array.from({ length: 30 }, (_, i) => `f${i}: z.number()`).join(', ');
    const out = zodToTsLogic.transform(`z.object({ ${fields} })`);
    expect(out).toContain('f0: number;');
    expect(out).toContain('f29: number;');
    expect(out.indexOf('f0: number;')).toBeLessThan(out.indexOf('f29: number;'));
    // 30 field lines + opening + closing brace
    expect(out.split('\n')).toHaveLength(32);
  });

  it('uses the first z.object when extra trailing text follows', () => {
    const out = zodToTsLogic.transform(
      'const S = z.object({ id: z.number() }); export type T = z.infer<typeof S>;',
    );
    expect(out).toContain('export interface Schema {');
    expect(out).toContain('id: number;');
  });
});
