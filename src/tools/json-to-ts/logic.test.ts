import { describe, it, expect } from 'vitest';
import { jsonToTsLogic } from './logic';

describe('jsonToTs', () => {
  it('generates a root interface with primitive fields', () => {
    const out = jsonToTsLogic.transform('{"id":1,"name":"Ada","active":true}');
    expect(out).toContain('export interface Root {');
    expect(out).toContain('id: number;');
    expect(out).toContain('name: string;');
    expect(out).toContain('active: boolean;');
  });
  it('creates nested interfaces for nested objects', () => {
    const out = jsonToTsLogic.transform('{"user":{"id":1}}');
    expect(out).toContain('user: User;');
    expect(out).toContain('export interface User {');
  });
  it('infers array element types', () => {
    expect(jsonToTsLogic.transform('{"tags":["a","b"]}')).toContain('tags: string[];');
  });
  it('quotes non-identifier keys', () => {
    expect(jsonToTsLogic.transform('{"a-b":1}')).toContain('"a-b": number;');
  });
  it('emits a type alias for an array root', () => {
    const out = jsonToTsLogic.transform('[{"id":1}]');
    expect(out).toContain('export type Root = RootItem[];');
    expect(out).toContain('export interface RootItem {');
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonToTsLogic.transform('{bad}')).toThrow();
  });
});
