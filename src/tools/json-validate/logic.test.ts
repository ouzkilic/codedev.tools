import { describe, it, expect } from 'vitest';
import { jsonValidateLogic } from './logic';

const run = (data: string, schema = '') =>
  jsonValidateLogic.transform(data, { options: {}, secondary: schema });

const schema = '{"type":"object","required":["id"],"properties":{"id":{"type":"number"}}}';

describe('jsonValidate', () => {
  it('reports valid JSON when no schema is provided', () => {
    expect(run('{"a":1}')).toMatch(/valid json/i);
  });
  it('confirms data matching the schema', () => {
    expect(run('{"id":1}', schema)).toMatch(/✓/);
  });
  it('lists schema violations', () => {
    const out = run('{"name":"x"}', schema);
    expect(out).toMatch(/✗/);
    expect(out).toMatch(/required/i);
  });
  it('reports a type mismatch', () => {
    expect(run('{"id":"not-a-number"}', schema)).toMatch(/✗/);
  });
  it('throws on invalid JSON data', () => {
    expect(() => run('{bad}', schema)).toThrow();
  });
});
