import { describe, it, expect } from 'vitest';
import { jsonSchemaToTsLogic } from './logic';

const t = (input: string) => jsonSchemaToTsLogic.transform(input);

describe('jsonSchemaToTsLogic', () => {
  it('generates Root interface with required and optional fields', () => {
    const out = t(
      '{"type":"object","properties":{"id":{"type":"integer"},"name":{"type":"string"}},"required":["id"]}',
    );
    expect(out).toContain('export interface Root {');
    expect(out).toContain('id: number;');
    expect(out).toContain('name?: string;');
  });

  it('maps array of strings', () => {
    const out = t(
      '{"type":"object","properties":{"tags":{"type":"array","items":{"type":"string"}}}}',
    );
    expect(out).toContain('tags?: string[];');
  });

  it('maps string enum to a union of quoted literals', () => {
    const out = t('{"type":"object","properties":{"role":{"enum":["a","b"]}}}');
    expect(out).toContain("'a' | 'b'");
  });

  it('maps boolean and number types', () => {
    const out = t(
      '{"type":"object","properties":{"active":{"type":"boolean"},"score":{"type":"number"}}}',
    );
    expect(out).toContain('active?: boolean;');
    expect(out).toContain('score?: number;');
  });

  it('generates nested interfaces referenced by PascalCase name', () => {
    const out = t(
      '{"type":"object","properties":{"user_info":{"type":"object","properties":{"email":{"type":"string"}}}}}',
    );
    expect(out).toContain('user_info?: UserInfo;');
    expect(out).toContain('export interface UserInfo {');
    expect(out).toContain('email?: string;');
  });

  it('throws on invalid JSON', () => {
    expect(() => t('{not json')).toThrow();
  });

  // --- error paths ---

  it('throws "Invalid JSON input" for malformed JSON', () => {
    expect(() => t('{"type":}')).toThrow('Invalid JSON input');
  });

  it('throws on empty string input', () => {
    expect(() => t('')).toThrow('Invalid JSON input');
  });

  it('throws on whitespace-only input', () => {
    expect(() => t('   \n\t  ')).toThrow('Invalid JSON input');
  });

  it('throws "JSON Schema must be an object" when parsed value is null', () => {
    expect(() => t('null')).toThrow('JSON Schema must be an object');
  });

  it('throws "JSON Schema must be an object" when parsed value is a number', () => {
    expect(() => t('5')).toThrow('JSON Schema must be an object');
  });

  it('throws "JSON Schema must be an object" when parsed value is a string', () => {
    expect(() => t('"hello"')).toThrow('JSON Schema must be an object');
  });

  it('throws "JSON Schema must be an object" when parsed value is a boolean', () => {
    expect(() => t('true')).toThrow('JSON Schema must be an object');
  });

  // --- empty / degenerate schemas ---

  it('emits an empty Root interface for an empty object schema', () => {
    const out = t('{}');
    expect(out).toBe('export interface Root {\n\n}');
  });

  it('treats a top-level array as an object with no properties (empty Root)', () => {
    // typeof [] === 'object' and not null, so it passes the guard;
    // properties ?? {} yields an empty body.
    const out = t('[1,2,3]');
    expect(out).toBe('export interface Root {\n\n}');
  });

  it('emits empty Root when type is object but no properties given', () => {
    const out = t('{"type":"object"}');
    expect(out).toBe('export interface Root {\n\n}');
  });

  // --- type mapping branches ---

  it('maps integer type to number', () => {
    const out = t('{"properties":{"age":{"type":"integer"}}}');
    expect(out).toContain('age?: number;');
  });

  it('maps null type literally', () => {
    const out = t('{"properties":{"x":{"type":"null"}}}');
    expect(out).toContain('x?: null;');
  });

  it('uses the first element when type is an array', () => {
    const out = t('{"properties":{"x":{"type":["string","null"]}}}');
    expect(out).toContain('x?: string;');
  });

  it('falls back to unknown for an object property without nested properties', () => {
    const out = t('{"properties":{"meta":{"type":"object"}}}');
    expect(out).toContain('meta?: unknown;');
  });

  it('falls back to unknown for unrecognized/absent type', () => {
    const out = t('{"properties":{"weird":{"type":"banana"}}}');
    expect(out).toContain('weird?: unknown;');
  });

  it('maps array without items to unknown[]', () => {
    const out = t('{"properties":{"list":{"type":"array"}}}');
    expect(out).toContain('list?: unknown[];');
  });

  it('maps array of objects to an interface array', () => {
    const out = t(
      '{"properties":{"users":{"type":"array","items":{"type":"object","properties":{"id":{"type":"integer"}}}}}}',
    );
    expect(out).toContain('users?: Users[];');
    expect(out).toContain('export interface Users {');
    expect(out).toContain('id?: number;');
  });

  it('maps nested arrays (array of array of numbers)', () => {
    const out = t(
      '{"properties":{"matrix":{"type":"array","items":{"type":"array","items":{"type":"number"}}}}}',
    );
    expect(out).toContain('matrix?: number[][];');
  });

  // --- enum branches ---

  it('does NOT build a union for a numeric enum (falls through to type)', () => {
    const out = t('{"properties":{"n":{"enum":[1,2,3],"type":"integer"}}}');
    expect(out).toContain('n?: number;');
    expect(out).not.toContain('1 | 2 | 3');
  });

  it('does NOT build a union for a mixed enum and falls back per type', () => {
    // mixed enum -> not all strings -> falls to switch; no type -> default -> unknown
    const out = t('{"properties":{"m":{"enum":["a",1]}}}');
    expect(out).toContain('m?: unknown;');
  });

  it('builds a single-member string union from a one-element enum', () => {
    const out = t('{"properties":{"only":{"enum":["x"]}}}');
    expect(out).toContain("only?: 'x';");
  });

  it('prefers enum union over the declared type when all enum values are strings', () => {
    const out = t(
      '{"properties":{"c":{"type":"string","enum":["red","green"]}}}',
    );
    expect(out).toContain("c?: 'red' | 'green';");
  });

  // --- required handling ---

  it('marks all listed required fields as non-optional', () => {
    const out = t(
      '{"properties":{"a":{"type":"string"},"b":{"type":"string"},"c":{"type":"string"}},"required":["a","c"]}',
    );
    expect(out).toContain('a: string;');
    expect(out).toContain('b?: string;');
    expect(out).toContain('c: string;');
  });

  // --- PascalCase naming ---

  it('PascalCases names with separators (snake, kebab, dot, space)', () => {
    const out = t(
      '{"properties":{"my-cool.field name":{"type":"object","properties":{"v":{"type":"string"}}}}}',
    );
    expect(out).toContain('export interface MyCoolFieldName {');
  });

  it('prefixes interface name with underscore when it would start with a digit', () => {
    const out = t(
      '{"properties":{"123abc":{"type":"object","properties":{"v":{"type":"string"}}}}}',
    );
    expect(out).toContain('export interface _123abc {');
    expect(out).toContain('123abc?: _123abc;');
  });

  it('names a nested interface "Field" when the key has no alphanumerics', () => {
    const out = t(
      '{"properties":{"___":{"type":"object","properties":{"v":{"type":"string"}}}}}',
    );
    expect(out).toContain('export interface Field {');
    expect(out).toContain('___?: Field;');
  });

  // --- ordering ---

  it('emits the Root interface before nested interfaces', () => {
    const out = t(
      '{"properties":{"child":{"type":"object","properties":{"v":{"type":"string"}}}}}',
    );
    const rootIdx = out.indexOf('export interface Root {');
    const childIdx = out.indexOf('export interface Child {');
    expect(rootIdx).toBeGreaterThanOrEqual(0);
    expect(childIdx).toBeGreaterThan(rootIdx);
  });

  it('separates interfaces with a blank line', () => {
    const out = t(
      '{"properties":{"child":{"type":"object","properties":{"v":{"type":"string"}}}}}',
    );
    expect(out).toContain('}\n\nexport interface Child {');
  });

  // --- determinism ---

  it('is deterministic across repeated calls', () => {
    const input =
      '{"type":"object","properties":{"id":{"type":"integer"},"tags":{"type":"array","items":{"type":"string"}}},"required":["id"]}';
    expect(t(input)).toBe(t(input));
  });

  // --- unicode / special content ---

  it('preserves unicode and emoji enum values verbatim', () => {
    const out = t('{"properties":{"e":{"enum":["café","🚀"]}}}');
    expect(out).toContain("'café' | '🚀'");
  });

  it('keeps the property key verbatim even when it is non-ascii', () => {
    const out = t('{"properties":{"ünïcode":{"type":"string"}}}');
    expect(out).toContain('ünïcode?: string;');
  });

  // --- larger / deep input ---

  it('handles a deeply nested schema and emits each level', () => {
    const out = t(
      '{"type":"object","properties":{"level1":{"type":"object","properties":{"level2":{"type":"object","properties":{"deep":{"type":"string"}}}}}}}',
    );
    expect(out).toContain('export interface Root {');
    expect(out).toContain('export interface Level1 {');
    expect(out).toContain('export interface Level2 {');
    expect(out).toContain('deep?: string;');
  });

  it('handles many sibling properties', () => {
    const props = Array.from({ length: 50 }, (_, i) => `"p${i}":{"type":"string"}`).join(',');
    const out = t(`{"properties":{${props}}}`);
    expect(out).toContain('p0?: string;');
    expect(out).toContain('p49?: string;');
    // 50 property lines inside the single Root interface
    expect(out.match(/: string;/g)?.length).toBe(50);
  });
});
