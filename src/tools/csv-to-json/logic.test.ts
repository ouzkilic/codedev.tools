import { describe, it, expect } from 'vitest';
import { csvToJsonLogic } from './logic';

const toObj = (s: string) => JSON.parse(csvToJsonLogic.transform(s));

describe('csvToJson', () => {
  it('uses the header row as object keys', () => {
    expect(toObj('a,b\n1,2\n3,4')).toEqual([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
  });
  it('coerces types and keeps strings', () => {
    expect(toObj('name,active\nAda,true')).toEqual([{ name: 'Ada', active: true }]);
  });
  it('skips empty lines', () => {
    expect(toObj('a\n1\n\n2')).toEqual([{ a: 1 }, { a: 2 }]);
  });
});
