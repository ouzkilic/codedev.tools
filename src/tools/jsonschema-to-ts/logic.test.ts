import { describe, it, expect } from 'vitest';
import { jsonSchemaToTsLogic } from './logic';

describe('jsonSchemaToTsLogic', () => {
  it('generates Root interface with required and optional fields', () => {
    const out = jsonSchemaToTsLogic.transform(
      '{"type":"object","properties":{"id":{"type":"integer"},"name":{"type":"string"}},"required":["id"]}',
    );
    expect(out).toContain('export interface Root {');
    expect(out).toContain('id: number;');
    expect(out).toContain('name?: string;');
  });

  it('maps array of strings', () => {
    const out = jsonSchemaToTsLogic.transform(
      '{"type":"object","properties":{"tags":{"type":"array","items":{"type":"string"}}}}',
    );
    expect(out).toContain('tags?: string[];');
  });

  it('maps string enum to a union of quoted literals', () => {
    const out = jsonSchemaToTsLogic.transform(
      '{"type":"object","properties":{"role":{"enum":["a","b"]}}}',
    );
    expect(out).toContain("'a' | 'b'");
  });

  it('maps boolean and number types', () => {
    const out = jsonSchemaToTsLogic.transform(
      '{"type":"object","properties":{"active":{"type":"boolean"},"score":{"type":"number"}}}',
    );
    expect(out).toContain('active?: boolean;');
    expect(out).toContain('score?: number;');
  });

  it('generates nested interfaces referenced by PascalCase name', () => {
    const out = jsonSchemaToTsLogic.transform(
      '{"type":"object","properties":{"user_info":{"type":"object","properties":{"email":{"type":"string"}}}}}',
    );
    expect(out).toContain('user_info?: UserInfo;');
    expect(out).toContain('export interface UserInfo {');
    expect(out).toContain('email?: string;');
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonSchemaToTsLogic.transform('{not json')).toThrow();
  });
});
