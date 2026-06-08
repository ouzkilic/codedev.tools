import { describe, it, expect } from 'vitest';
import { jsonToPropertiesLogic } from './logic';

describe('jsonToPropertiesLogic', () => {
  it('converts flat object', () => {
    expect(jsonToPropertiesLogic.transform('{"a":1,"b":"x"}')).toBe('a=1\nb=x');
  });

  it('dots nested object keys', () => {
    expect(jsonToPropertiesLogic.transform('{"x":{"y":1}}')).toBe('x.y=1');
  });

  it('handles deeply nested keys', () => {
    expect(jsonToPropertiesLogic.transform('{"a":{"b":{"c":true}}}')).toBe('a.b.c=true');
  });

  it('uses dotted index keys for arrays', () => {
    expect(jsonToPropertiesLogic.transform('{"list":[10,20]}')).toBe('list.0=10\nlist.1=20');
  });

  it('throws on a top-level array', () => {
    expect(() => jsonToPropertiesLogic.transform('[1,2]')).toThrow();
  });

  it('throws on invalid JSON', () => {
    expect(() => jsonToPropertiesLogic.transform('{not json')).toThrow();
  });
});
