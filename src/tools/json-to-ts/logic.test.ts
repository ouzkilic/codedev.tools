import { describe, it, expect } from 'vitest';
import { jsonToTsLogic } from './logic';

const t = (input: string) => jsonToTsLogic.transform(input);

describe('jsonToTs - root object happy paths', () => {
  it('generates a root interface with primitive fields', () => {
    const out = t('{"id":1,"name":"Ada","active":true}');
    expect(out).toContain('export interface Root {');
    expect(out).toContain('id: number;');
    expect(out).toContain('name: string;');
    expect(out).toContain('active: boolean;');
  });

  it('maps null values to the null type', () => {
    expect(t('{"x":null}')).toContain('x: null;');
  });

  it('emits an empty interface body for an empty object root', () => {
    expect(t('{}')).toBe('export interface Root {}');
  });

  it('emits a nested empty interface for an empty nested object', () => {
    const out = t('{"meta":{}}');
    expect(out).toContain('meta: Meta;');
    expect(out).toContain('export interface Meta {}');
  });
});

describe('jsonToTs - nesting and ordering', () => {
  it('creates nested interfaces for nested objects', () => {
    const out = t('{"user":{"id":1}}');
    expect(out).toContain('user: User;');
    expect(out).toContain('export interface User {');
  });

  it('places the root interface first, nested ones after', () => {
    const out = t('{"user":{"id":1}}');
    expect(out.indexOf('export interface Root {')).toBeLessThan(
      out.indexOf('export interface User {'),
    );
  });

  it('separates multiple interfaces with a blank line', () => {
    const out = t('{"user":{"id":1}}');
    expect(out).toContain('}\n\nexport interface User');
  });

  it('handles deeply nested objects', () => {
    const out = t('{"a":{"b":{"c":1}}}');
    expect(out).toContain('a: A;');
    expect(out).toContain('b: B;');
    expect(out).toContain('c: number;');
    // Root, then A, then B by insertion order reversed.
    expect(out.indexOf('interface Root')).toBeLessThan(out.indexOf('interface A'));
    expect(out.indexOf('interface A')).toBeLessThan(out.indexOf('interface B'));
  });
});

describe('jsonToTs - arrays', () => {
  it('infers array element types for primitives', () => {
    expect(t('{"tags":["a","b"]}')).toContain('tags: string[];');
  });

  it('infers number array element types', () => {
    expect(t('{"nums":[1,2,3]}')).toContain('nums: number[];');
  });

  it('uses unknown[] for an empty array field', () => {
    expect(t('{"items":[]}')).toContain('items: unknown[];');
  });

  it('infers only the first element type of an array of objects', () => {
    // singular("items") -> "item" -> pascal -> "Item"
    const out = t('{"items":[{"id":1}]}');
    expect(out).toContain('items: Item[];');
    expect(out).toContain('export interface Item {');
    expect(out).toContain('id: number;');
  });

  it('nests arrays of arrays', () => {
    expect(t('{"grid":[[1,2],[3,4]]}')).toContain('grid: number[][];');
  });
});

describe('jsonToTs - key handling', () => {
  it('quotes non-identifier keys', () => {
    expect(t('{"a-b":1}')).toContain('"a-b": number;');
  });

  it('quotes keys starting with a digit', () => {
    expect(t('{"1key":1}')).toContain('"1key": number;');
  });

  it('keeps valid identifier keys unquoted including $ and _', () => {
    const out = t('{"$ref":1,"_id":2,"camelCase":3}');
    expect(out).toContain('$ref: number;');
    expect(out).toContain('_id: number;');
    expect(out).toContain('camelCase: number;');
  });

  it('quotes keys with spaces', () => {
    expect(t('{"first name":"x"}')).toContain('"first name": string;');
  });

  it('quotes unicode/emoji keys', () => {
    const out = t('{"ékey":1,"🚀":2}');
    // é is not in the ASCII-only valid-key regex, so it is quoted via JSON.stringify.
    expect(out).toContain('"ékey": number;');
    expect(out).toContain('"🚀": number;');
  });
});

describe('jsonToTs - non-object roots', () => {
  it('emits a type alias for an array-of-objects root', () => {
    const out = t('[{"id":1}]');
    expect(out).toContain('export type Root = RootItem[];');
    expect(out).toContain('export interface RootItem {');
  });

  it('emits a type alias for a primitive array root', () => {
    expect(t('[1,2,3]')).toBe('export type Root = number[];');
  });

  it('emits unknown[] alias for an empty array root', () => {
    expect(t('[]')).toBe('export type Root = unknown[];');
  });

  it('emits a string type alias for a string root', () => {
    expect(t('"hello"')).toBe('export type Root = string;');
  });

  it('emits a number type alias for a number root', () => {
    expect(t('42')).toBe('export type Root = number;');
  });

  it('emits a boolean type alias for a boolean root', () => {
    expect(t('false')).toBe('export type Root = boolean;');
  });

  it('emits a null type alias for a null root', () => {
    expect(t('null')).toBe('export type Root = null;');
  });

  it('places the Root alias before element interfaces', () => {
    const out = t('[{"id":1}]');
    expect(out.indexOf('export type Root')).toBeLessThan(
      out.indexOf('export interface RootItem'),
    );
  });
});

describe('jsonToTs - name collisions and pascal casing', () => {
  it('disambiguates colliding interface names with a numeric suffix', () => {
    // both keys pascal-case to "UserName"
    const out = t('{"user_name":{"x":1},"userName":{"y":2}}');
    expect(out).toContain('user_name: UserName;');
    expect(out).toContain('userName: UserName2;');
    expect(out).toContain('export interface UserName {');
    expect(out).toContain('export interface UserName2 {');
  });

  it('falls back to Item when a key has no alphanumeric chars', () => {
    // key "---" pascal -> "" -> "Item"
    const out = t('{"---":{"x":1}}');
    expect(out).toContain('"---": Item;');
    expect(out).toContain('export interface Item {');
  });
});

describe('jsonToTs - edge cases and numbers', () => {
  it('treats zero, negative and float numbers all as number', () => {
    const out = t('{"a":0,"b":-5,"c":3.14,"d":-0.001}');
    expect(out).toContain('a: number;');
    expect(out).toContain('b: number;');
    expect(out).toContain('c: number;');
    expect(out).toContain('d: number;');
  });

  it('treats very large numbers as number', () => {
    expect(t('{"big":1e308}')).toContain('big: number;');
  });

  it('handles unicode/emoji string values as string', () => {
    expect(t('{"msg":"café 🚀"}')).toContain('msg: string;');
  });

  it('handles a large object with many keys', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 200; i++) obj[`k${i}`] = i;
    const out = t(JSON.stringify(obj));
    expect(out).toContain('k0: number;');
    expect(out).toContain('k199: number;');
    expect(out.match(/: number;/g)?.length).toBe(200);
  });

  it('is deterministic / idempotent for the same input', () => {
    const input = '{"id":1,"nested":{"v":true},"list":[{"q":"x"}]}';
    expect(t(input)).toBe(t(input));
  });
});

describe('jsonToTs - error paths', () => {
  it('throws on malformed JSON', () => {
    expect(() => t('{bad}')).toThrow();
  });

  it('throws on empty string', () => {
    expect(() => t('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => t('   \n\t ')).toThrow();
  });

  it('throws on a trailing comma', () => {
    expect(() => t('{"a":1,}')).toThrow();
  });

  it('throws on an unterminated string', () => {
    expect(() => t('{"a":"x}')).toThrow();
  });
});
