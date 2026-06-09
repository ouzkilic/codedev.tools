import { describe, it, expect } from 'vitest';
import { jsonUnflattenLogic } from './logic';

const unflat = (s: string) => JSON.parse(jsonUnflattenLogic.transform(s));

describe('jsonUnflatten', () => {
  it('rebuilds nested objects from dot paths', () => {
    expect(unflat('{"a.b.c":1}')).toEqual({ a: { b: { c: 1 } } });
  });

  it('rebuilds arrays from bracket paths', () => {
    expect(unflat('{"a[0]":1,"a[1]":2}')).toEqual({ a: [1, 2] });
  });

  it('rebuilds objects nested inside arrays', () => {
    expect(unflat('{"a[0].b":1,"a[1].c":2}')).toEqual({ a: [{ b: 1 }, { c: 2 }] });
  });

  it('round-trips with a typical nested object', () => {
    expect(unflat('{"user.name":"Ada","user.roles[0]":"admin"}')).toEqual({
      user: { name: 'Ada', roles: ['admin'] },
    });
  });

  it('throws when input is a top-level array', () => {
    expect(() => jsonUnflattenLogic.transform('[1,2]')).toThrow();
  });

  it('throws when input is null', () => {
    expect(() => jsonUnflattenLogic.transform('null')).toThrow();
  });

  it('throws when input is a number primitive', () => {
    expect(() => jsonUnflattenLogic.transform('42')).toThrow();
  });

  it('throws when input is a string primitive', () => {
    expect(() => jsonUnflattenLogic.transform('"hello"')).toThrow();
  });

  it('throws when input is a boolean primitive', () => {
    expect(() => jsonUnflattenLogic.transform('true')).toThrow();
  });

  it('throws on malformed / non-JSON input', () => {
    expect(() => jsonUnflattenLogic.transform('{not json')).toThrow();
  });

  it('throws on empty string', () => {
    expect(() => jsonUnflattenLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => jsonUnflattenLogic.transform('   \n\t ')).toThrow();
  });

  it('returns empty object for an empty flat object', () => {
    expect(unflat('{}')).toEqual({});
  });

  it('preserves all primitive value types', () => {
    expect(unflat('{"s":"x","n":1,"b":true,"nil":null,"f":1.5,"neg":-3}')).toEqual({
      s: 'x',
      n: 1,
      b: true,
      nil: null,
      f: 1.5,
      neg: -3,
    });
  });

  it('builds a top-level array when first token is numeric', () => {
    expect(unflat('{"[0]":1,"[1]":2}')).toEqual([1, 2]);
  });

  it('handles a single dotted key with two segments', () => {
    expect(unflat('{"a.b":42}')).toEqual({ a: { b: 42 } });
  });

  it('handles deeply nested mixed object/array paths', () => {
    expect(unflat('{"a.b[0].c[1]":7}')).toEqual({ a: { b: [{ c: [null, 7] }] } });
  });

  it('produces sparse-array holes serialized as null', () => {
    // index 2 set, indices 0 and 1 are holes -> JSON.stringify turns holes into null
    expect(unflat('{"a[2]":9}')).toEqual({ a: [null, null, 9] });
  });

  it('keeps object values verbatim when assigned to a leaf', () => {
    expect(unflat('{"a.b":{"x":1}}')).toEqual({ a: { b: { x: 1 } } });
  });

  it('keeps array values verbatim when assigned to a leaf', () => {
    expect(unflat('{"a":[1,2,3]}')).toEqual({ a: [1, 2, 3] });
  });

  it('treats leading separators as no-ops (tokens collapse)', () => {
    // ".a.b" tokenizes to ['a','b'] because dots are pure separators
    expect(unflat('{".a.b":1}')).toEqual({ a: { b: 1 } });
  });

  it('treats trailing separators as no-ops', () => {
    expect(unflat('{"a.b.":1}')).toEqual({ a: { b: 1 } });
  });

  it('collapses consecutive separators', () => {
    expect(unflat('{"a..b":1}')).toEqual({ a: { b: 1 } });
  });

  it('skips keys that tokenize to nothing but still emits other keys', () => {
    // "." has no tokens and is skipped; the other key still builds the root
    expect(unflat('{".":1,"a":2}')).toEqual({ a: 2 });
  });

  it('returns empty object when every key tokenizes to nothing', () => {
    expect(unflat('{".":1}')).toEqual({});
  });

  it('supports unicode and emoji in keys and values', () => {
    expect(unflat('{"naïve.café":"déjà","emoji.x":"😀"}')).toEqual({
      'naïve': { 'café': 'déjà' },
      emoji: { x: '😀' },
    });
  });

  it('keeps non-digit bracket-like content as a string token (object branch)', () => {
    // \[(\d+)\] only matches digits; "-1" matches the [^.[\]]+ branch as a string
    expect(unflat('{"a[-1]":5}')).toEqual({ a: { '-1': 5 } });
  });

  it('handles multi-digit array indices', () => {
    const out = unflat('{"a[10]":"ten"}');
    expect(out.a[10]).toBe('ten');
    expect(out.a).toHaveLength(11);
  });

  it('merges multiple keys sharing a common prefix', () => {
    expect(unflat('{"a.b":1,"a.c":2,"a.d.e":3}')).toEqual({
      a: { b: 1, c: 2, d: { e: 3 } },
    });
  });

  it('handles a large input deterministically', () => {
    const pairs: string[] = [];
    for (let i = 0; i < 500; i++) pairs.push(`"item[${i}].id":${i}`);
    const out = unflat(`{${pairs.join(',')}}`);
    expect(out.item).toHaveLength(500);
    expect(out.item[0]).toEqual({ id: 0 });
    expect(out.item[499]).toEqual({ id: 499 });
  });

  it('emits 2-space pretty-printed output', () => {
    expect(jsonUnflattenLogic.transform('{"a.b":1}')).toBe('{\n  "a": {\n    "b": 1\n  }\n}');
  });

  it('is deterministic across repeated calls', () => {
    const input = '{"x.y[0]":1,"x.y[1]":2,"z":3}';
    const a = jsonUnflattenLogic.transform(input);
    const b = jsonUnflattenLogic.transform(input);
    expect(a).toBe(b);
  });

  it('handles boundary numeric values (zero and large)', () => {
    expect(unflat('{"a.zero":0,"a.big":9007199254740991}')).toEqual({
      a: { zero: 0, big: 9007199254740991 },
    });
  });

  it('builds nested arrays of arrays', () => {
    expect(unflat('{"m[0][0]":1,"m[0][1]":2,"m[1][0]":3}')).toEqual({
      m: [
        [1, 2],
        [3],
      ],
    });
  });
});
