import { describe, it, expect } from 'vitest';
import { tsToZodLogic } from './logic';

describe('tsToZodLogic', () => {
  it('converts a basic interface with optional member', () => {
    const out = tsToZodLogic.transform('interface User { id: number; name?: string; }');
    expect(out).toContain('import { z } from "zod";');
    expect(out).toContain('export const UserSchema = z.object({');
    expect(out).toContain('id: z.number()');
    expect(out).toContain('name: z.string().optional()');
  });

  it('maps arrays', () => {
    const out = tsToZodLogic.transform('interface X { tags: string[] }');
    expect(out).toContain('z.array(z.string())');
  });

  it('maps Array<T> and booleans', () => {
    const out = tsToZodLogic.transform('interface Y { flags: Array<boolean>; active: boolean; }');
    expect(out).toContain('flags: z.array(z.boolean())');
    expect(out).toContain('active: z.boolean()');
  });

  it('maps string literal unions to z.enum', () => {
    const out = tsToZodLogic.transform("interface Role { kind: 'a' | 'b'; }");
    expect(out).toContain("kind: z.enum(['a', 'b'])");
  });

  it('handles type-object alias with inline object', () => {
    const out = tsToZodLogic.transform('type Config = { nested: { count: number } };');
    expect(out).toContain('export const ConfigSchema = z.object({');
    expect(out).toContain('z.object({');
    expect(out).toContain('count: z.number()');
  });

  it('throws on invalid input', () => {
    expect(() => tsToZodLogic.transform('const x = 5;')).toThrow();
  });

  // --- error paths ---

  it('throws on empty input', () => {
    expect(() => tsToZodLogic.transform('')).toThrow('Input is empty');
  });

  it('throws on whitespace-only input', () => {
    expect(() => tsToZodLogic.transform('   \n\t  ')).toThrow('Input is empty');
  });

  it('throws when input cannot be parsed as interface or type-object', () => {
    expect(() => tsToZodLogic.transform('function foo() {}')).toThrow(
      'Could not parse a TypeScript interface or type-object',
    );
  });

  it('throws when a member has no colon', () => {
    expect(() => tsToZodLogic.transform('interface Bad { justAName }')).toThrow(
      /Invalid member/,
    );
  });

  it('throws when a member name is empty (e.g. only optional marker)', () => {
    expect(() => tsToZodLogic.transform('interface Bad { ?: string }')).toThrow(
      /Invalid member name/,
    );
  });

  // --- primitive type mapping ---

  it('maps string, number, boolean primitives', () => {
    const out = tsToZodLogic.transform('interface P { a: string; b: number; c: boolean; }');
    expect(out).toContain('a: z.string()');
    expect(out).toContain('b: z.number()');
    expect(out).toContain('c: z.boolean()');
  });

  it('maps any and unknown to z.unknown()', () => {
    const out = tsToZodLogic.transform('interface U { a: any; b: unknown; }');
    expect(out).toContain('a: z.unknown()');
    expect(out).toContain('b: z.unknown()');
  });

  it('maps null to z.null()', () => {
    const out = tsToZodLogic.transform('interface N { a: null; }');
    expect(out).toContain('a: z.null()');
  });

  it('maps an unrecognized/custom type to z.unknown()', () => {
    const out = tsToZodLogic.transform('interface C { ref: SomeCustomType; }');
    expect(out).toContain('ref: z.unknown()');
  });

  it('maps a lone string literal type to z.literal', () => {
    const out = tsToZodLogic.transform("interface L { kind: 'fixed'; }");
    expect(out).toContain("kind: z.literal('fixed')");
  });

  // --- unions ---

  it('maps a non-literal union to z.union', () => {
    const out = tsToZodLogic.transform('interface M { v: string | number; }');
    expect(out).toContain('v: z.union([z.string(), z.number()])');
  });

  it('maps a mixed literal/non-literal union to z.union (not z.enum)', () => {
    const out = tsToZodLogic.transform("interface Mix { v: 'a' | number; }");
    expect(out).toContain("v: z.union([z.literal('a'), z.number()])");
    expect(out).not.toContain('z.enum');
  });

  it('uses single quotes for enum values regardless of source quote style', () => {
    const out = tsToZodLogic.transform('interface Q { kind: "x" | "y"; }');
    expect(out).toContain("kind: z.enum(['x', 'y'])");
  });

  // --- arrays ---

  it('maps nested arrays (string[][])', () => {
    const out = tsToZodLogic.transform('interface NA { grid: string[][]; }');
    expect(out).toContain('grid: z.array(z.array(z.string()))');
  });

  it('maps Array<Array<number>>', () => {
    const out = tsToZodLogic.transform('interface NA2 { grid: Array<Array<number>>; }');
    expect(out).toContain('grid: z.array(z.array(z.number()))');
  });

  // --- nesting / depth-aware splitting ---

  it('does not split a union that is nested inside an inline object member', () => {
    const out = tsToZodLogic.transform(
      'interface Deep { inner: { kind: string | number } }',
    );
    expect(out).toContain('inner: z.object({');
    expect(out).toContain('kind: z.union([z.string(), z.number()])');
  });

  it('respects nesting when splitting members containing inline objects', () => {
    const out = tsToZodLogic.transform(
      'interface Two { a: { x: number }; b: string; }',
    );
    expect(out).toContain('a: z.object({');
    expect(out).toContain('x: z.number()');
    expect(out).toContain('b: z.string()');
  });

  // --- export prefix and type alias variants ---

  it('accepts the export keyword on an interface', () => {
    const out = tsToZodLogic.transform('export interface E { a: string; }');
    expect(out).toContain('export const ESchema = z.object({');
  });

  it('accepts the export keyword on a type alias', () => {
    const out = tsToZodLogic.transform('export type T = { a: string; };');
    expect(out).toContain('export const TSchema = z.object({');
  });

  it('preserves the declared name including underscores and dollar signs', () => {
    const out = tsToZodLogic.transform('interface $My_Type { a: string; }');
    expect(out).toContain('export const $My_TypeSchema = z.object({');
  });

  // --- optional combined with complex types ---

  it('appends .optional() after array mapping', () => {
    const out = tsToZodLogic.transform('interface O { tags?: string[]; }');
    expect(out).toContain('tags: z.array(z.string()).optional()');
  });

  // --- members split by newline (no semicolons) ---

  it('splits members separated by newlines', () => {
    const out = tsToZodLogic.transform('interface NL {\n  a: string\n  b: number\n}');
    expect(out).toContain('a: z.string()');
    expect(out).toContain('b: z.number()');
  });

  // --- edge: unicode/emoji literal values ---

  it('handles unicode/emoji string literal values in an enum', () => {
    const out = tsToZodLogic.transform("interface Emo { e: '🚀' | '✨'; }");
    expect(out).toContain("e: z.enum(['🚀', '✨'])");
  });

  // --- output structure / idempotency-ish properties ---

  it('always emits the zod import header and a named schema export', () => {
    const out = tsToZodLogic.transform('interface Hdr { a: string; }');
    expect(out.startsWith('import { z } from "zod";')).toBe(true);
    expect(out).toMatch(/export const HdrSchema = z\.object\(\{/);
  });

  it('produces deterministic output for the same input', () => {
    const input = 'interface D { a: string; b: number; }';
    expect(tsToZodLogic.transform(input)).toBe(tsToZodLogic.transform(input));
  });

  it('handles a larger interface with many members', () => {
    const fields = Array.from({ length: 30 }, (_, i) => `f${i}: string;`).join(' ');
    const out = tsToZodLogic.transform(`interface Big { ${fields} }`);
    expect(out).toContain('f0: z.string()');
    expect(out).toContain('f29: z.string()');
  });
});
