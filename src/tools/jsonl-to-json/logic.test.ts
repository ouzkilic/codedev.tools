import { describe, it, expect } from 'vitest';
import { jsonlToJsonLogic } from './logic';

describe('jsonlToJson', () => {
  it('parses each line into an array', () => {
    expect(JSON.parse(jsonlToJsonLogic.transform('{"a":1}\n{"b":2}'))).toEqual([{ a: 1 }, { b: 2 }]);
  });
  it('ignores blank lines and surrounding whitespace', () => {
    expect(JSON.parse(jsonlToJsonLogic.transform('  {"a":1}  \n\n{"b":2}\n'))).toEqual([{ a: 1 }, { b: 2 }]);
  });
  it('reports the offending line number on bad input', () => {
    expect(() => jsonlToJsonLogic.transform('{"a":1}\n{bad}')).toThrow(/line 2/);
  });
});
