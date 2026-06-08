import { describe, expect, it } from 'vitest';
import { graphqlFormatLogic } from './logic';

describe('graphqlFormatLogic', () => {
  it('formats a query', () => {
    const out = graphqlFormatLogic.transform('query{a b{c}}', { options: {}, secondary: '' });
    expect(out).toContain('a');
    expect(out).toContain('b {');
    expect(out).toContain('c');
  });

  it('formats a schema definition', () => {
    const out = graphqlFormatLogic.transform('type X{a:Int}', { options: {}, secondary: '' });
    expect(out).toContain('type X {');
  });

  it('throws on invalid GraphQL', () => {
    expect(() => graphqlFormatLogic.transform('{', { options: {}, secondary: '' })).toThrow();
  });
});
