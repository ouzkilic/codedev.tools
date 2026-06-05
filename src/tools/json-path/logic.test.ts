import { describe, it, expect } from 'vitest';
import { jsonPathLogic } from './logic';

const query = (json: string, path: string) =>
  JSON.parse(jsonPathLogic.transform(json, { options: { query: path }, secondary: '' }));

const data = '{"items":[{"id":1,"name":"a"},{"id":2,"name":"b"}]}';

describe('jsonPath', () => {
  it('selects a field across array elements', () => {
    expect(query(data, '$.items[*].id')).toEqual([1, 2]);
  });
  it('selects a single nested value', () => {
    expect(query(data, '$.items[0].name')).toEqual(['a']);
  });
  it('supports recursive descent', () => {
    expect(query(data, '$..name')).toEqual(['a', 'b']);
  });
  it('returns an empty array when nothing matches', () => {
    expect(query(data, '$.missing')).toEqual([]);
  });
  it('throws on invalid JSON input', () => {
    expect(() => jsonPathLogic.transform('{bad}', { options: { query: '$' }, secondary: '' })).toThrow();
  });
});
