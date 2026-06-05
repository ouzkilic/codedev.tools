import { describe, it, expect } from 'vitest';
import { jsonToJsonlLogic } from './logic';

describe('jsonToJsonl', () => {
  it('emits one compact line per array element', () => {
    expect(jsonToJsonlLogic.transform('[{"a":1},{"b":2}]')).toBe('{"a":1}\n{"b":2}');
  });
  it('handles primitive elements', () => {
    expect(jsonToJsonlLogic.transform('[1,"x",true,null]')).toBe('1\n"x"\ntrue\nnull');
  });
  it('returns empty string for an empty array', () => {
    expect(jsonToJsonlLogic.transform('[]')).toBe('');
  });
  it('throws when input is not an array', () => {
    expect(() => jsonToJsonlLogic.transform('{"a":1}')).toThrow(/array/i);
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonToJsonlLogic.transform('[bad]')).toThrow();
  });
});
