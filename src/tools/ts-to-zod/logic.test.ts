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
});
