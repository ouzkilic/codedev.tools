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
  it('throws when input is not a flat object', () => {
    expect(() => jsonUnflattenLogic.transform('[1,2]')).toThrow();
  });
});
