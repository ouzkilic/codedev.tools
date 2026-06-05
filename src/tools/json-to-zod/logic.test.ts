import { describe, it, expect } from 'vitest';
import { jsonToZodLogic } from './logic';

describe('jsonToZod', () => {
  it('generates a Zod schema from JSON', () => {
    const out = jsonToZodLogic.transform('{"a":1,"b":"x"}');
    expect(out).toContain('import { z } from "zod";');
    expect(out).toContain('const schema = z.object({');
    expect(out).toContain('a: z.number()');
    expect(out).toContain('b: z.string()');
  });
  it('throws on invalid JSON', () => {
    expect(() => jsonToZodLogic.transform('{bad}')).toThrow();
  });
});
