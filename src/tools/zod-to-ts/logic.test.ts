import { describe, it, expect } from 'vitest';
import { zodToTsLogic } from './logic';

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
});
