import { describe, it, expect } from 'vitest';
import { jsonToProtoLogic } from './logic';

describe('jsonToProtoLogic', () => {
  it('infers scalar fields with proto3 syntax', () => {
    const out = jsonToProtoLogic.transform('{"id":1,"name":"x","active":true}', {
      options: {},
      secondary: '',
    });
    expect(out.startsWith('syntax = "proto3";\n\n')).toBe(true);
    expect(out).toContain('message Root {');
    expect(out).toContain('int64 id = 1;');
    expect(out).toContain('string name = 2;');
    expect(out).toContain('bool active = 3;');
  });

  it('infers repeated string for arrays', () => {
    const out = jsonToProtoLogic.transform('{"tags":["a"]}', {
      options: {},
      secondary: '',
    });
    expect(out).toContain('repeated string tags = 1;');
  });

  it('uses double for non-integer numbers', () => {
    const out = jsonToProtoLogic.transform('{"ratio":1.5}', { options: {}, secondary: '' });
    expect(out).toContain('double ratio = 1;');
  });

  it('creates nested messages for objects', () => {
    const out = jsonToProtoLogic.transform('{"user":{"age":3}}', { options: {}, secondary: '' });
    expect(out).toContain('message User {');
    expect(out).toContain('int64 age = 1;');
    expect(out).toContain('User user = 1;');
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonToProtoLogic.transform('not json', { options: {}, secondary: '' })).toThrow();
  });
});
