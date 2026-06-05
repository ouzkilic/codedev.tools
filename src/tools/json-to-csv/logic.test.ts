import { describe, it, expect } from 'vitest';
import { jsonToCsvLogic } from './logic';

describe('jsonToCsv', () => {
  it('writes a header row plus data rows', () => {
    expect(jsonToCsvLogic.transform('[{"a":1,"b":2},{"a":3,"b":4}]')).toBe('a,b\n1,2\n3,4');
  });
  it('quotes values containing commas', () => {
    expect(jsonToCsvLogic.transform('[{"a":"x,y"}]')).toBe('a\n"x,y"');
  });
  it('throws when input is not an array', () => {
    expect(() => jsonToCsvLogic.transform('{"a":1}')).toThrow(/array/i);
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonToCsvLogic.transform('[bad]')).toThrow();
  });
});
