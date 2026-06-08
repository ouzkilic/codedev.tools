import { describe, it, expect } from 'vitest';
import { jsonPatchLogic } from './logic';

function run(input: string, patch: string): string {
  return jsonPatchLogic.transform(input, { options: {}, secondary: patch });
}

describe('jsonPatchLogic', () => {
  it('adds a property', () => {
    const out = run('{"a":1}', '[{"op":"add","path":"/b","value":2}]');
    expect(JSON.parse(out)).toEqual({ a: 1, b: 2 });
  });

  it('replaces a property', () => {
    const out = run('{"a":1}', '[{"op":"replace","path":"/a","value":9}]');
    expect(JSON.parse(out)).toEqual({ a: 9 });
  });

  it('removes a property', () => {
    const out = run('{"a":1}', '[{"op":"remove","path":"/a"}]');
    expect(JSON.parse(out)).toEqual({});
  });

  it('appends to an array with "-"', () => {
    const out = run('{"l":[1,2]}', '[{"op":"add","path":"/l/-","value":3}]');
    expect(JSON.parse(out)).toEqual({ l: [1, 2, 3] });
  });

  it('moves a value', () => {
    const out = run('{"a":1,"b":2}', '[{"op":"move","from":"/a","path":"/c"}]');
    expect(JSON.parse(out)).toEqual({ b: 2, c: 1 });
  });

  it('copies a value', () => {
    const out = run('{"a":1}', '[{"op":"copy","from":"/a","path":"/b"}]');
    expect(JSON.parse(out)).toEqual({ a: 1, b: 1 });
  });

  it('passes a matching test op', () => {
    const out = run('{"a":1}', '[{"op":"test","path":"/a","value":1}]');
    expect(JSON.parse(out)).toEqual({ a: 1 });
  });

  it('throws when a test op fails', () => {
    expect(() =>
      run('{"a":1}', '[{"op":"test","path":"/a","value":2}]'),
    ).toThrow();
  });

  it('returns the document unchanged when patch is empty', () => {
    const out = run('{"a":1}', '');
    expect(JSON.parse(out)).toEqual({ a: 1 });
  });

  it('throws when patch is not an array', () => {
    expect(() => run('{"a":1}', '{"op":"add"}')).toThrow();
  });
});
