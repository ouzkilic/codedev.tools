import { describe, it, expect } from 'vitest';
import { jsonToGraphqlLogic } from './logic';

const run = (input: string) =>
  jsonToGraphqlLogic.transform(input, { options: {}, secondary: '' });

describe('jsonToGraphqlLogic', () => {
  it('maps scalar fields', () => {
    const out = run('{"id":1,"name":"x","price":2.5}');
    expect(out).toContain('type Root {');
    expect(out).toContain('id: Int');
    expect(out).toContain('name: String');
    expect(out).toContain('price: Float');
  });

  it('creates nested named types', () => {
    const out = run('{"user":{"id":1}}');
    expect(out).toContain('user: User');
    expect(out).toContain('type User {');
  });

  it('maps booleans and arrays', () => {
    const out = run('{"active":true,"tags":["a"],"empty":[]}');
    expect(out).toContain('active: Boolean');
    expect(out).toContain('tags: [String]');
    expect(out).toContain('empty: [String]');
  });

  it('places Root before nested types', () => {
    const out = run('{"user":{"id":1}}');
    expect(out.indexOf('type Root {')).toBeLessThan(out.indexOf('type User {'));
  });
});
