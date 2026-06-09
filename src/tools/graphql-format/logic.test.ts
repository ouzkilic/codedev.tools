import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { graphqlFormatLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };
const fmt = (input: string) => graphqlFormatLogic.transform(input, ctx);

describe('graphqlFormatLogic', () => {
  it('formats a compact query with nested selection', () => {
    expect(fmt('query{a b{c}}')).toBe('{\n  a\n  b {\n    c\n  }\n}');
  });

  it('drops the redundant "query" keyword on an anonymous operation', () => {
    // `query{...}` prints as a shorthand `{...}` because the operation is anonymous
    const out = fmt('query{a b{c}}');
    expect(out.startsWith('{')).toBe(true);
    expect(out).not.toContain('query');
  });

  it('formats a type definition', () => {
    expect(fmt('type X{a:Int}')).toBe('type X {\n  a: Int\n}');
  });

  it('formats a mutation with variables and arguments', () => {
    const out = fmt('mutation M($id: ID!){ del(id:$id){ok} }');
    expect(out).toBe('mutation M($id: ID!) {\n  del(id: $id) {\n    ok\n  }\n}');
  });

  it('formats a named query (keyword preserved when named)', () => {
    const out = fmt('query Q { a }');
    expect(out).toBe('query Q {\n  a\n}');
  });

  it('formats a fragment definition and its spread, separated by a blank line', () => {
    const out = fmt('fragment F on User{name email} {...F}');
    expect(out).toBe('fragment F on User {\n  name\n  email\n}\n\n{\n  ...F\n}');
  });

  it('preserves field aliases', () => {
    expect(fmt('{ foo: bar }')).toBe('{\n  foo: bar\n}');
  });

  it('formats scalar arguments with spacing after the colon', () => {
    expect(fmt('{ user(id:4,active:true){name} }')).toBe(
      '{\n  user(id: 4, active: true) {\n    name\n  }\n}',
    );
  });

  it('formats inline fragments with type conditions', () => {
    expect(fmt('{ a { ... on B { c } } }')).toBe(
      '{\n  a {\n    ... on B {\n      c\n    }\n  }\n}',
    );
  });

  it('preserves directives on operations', () => {
    expect(fmt('query @cached { a }')).toBe('query @cached {\n  a\n}');
  });

  it('formats scalar and enum type definitions with blank-line separation', () => {
    expect(fmt('scalar Date enum Color{RED GREEN}')).toBe(
      'scalar Date\n\nenum Color {\n  RED\n  GREEN\n}',
    );
  });

  it('formats list and non-null type wrappers', () => {
    expect(fmt('type T { f: [Int!]! }')).toBe('type T {\n  f: [Int!]!\n}');
  });

  it('formats a block-string description as a triple-quoted block', () => {
    expect(fmt('"""doc""" type T { a: Int }')).toBe('"""doc"""\ntype T {\n  a: Int\n}');
  });

  it('formats a single-line string description on its own line', () => {
    expect(fmt('"a desc" type T { a: Int }')).toBe('"a desc"\ntype T {\n  a: Int\n}');
  });

  it('separates multiple operations with a blank line', () => {
    expect(fmt('query A { a } query B { b }')).toBe('query A {\n  a\n}\n\nquery B {\n  b\n}');
  });

  it('strips comments (they are not part of the printed AST)', () => {
    const out = fmt('{ # hi\n a }');
    expect(out).toBe('{\n  a\n}');
    expect(out).not.toContain('#');
  });

  it('preserves unicode and emoji inside string arguments', () => {
    expect(fmt('{ field(arg: "héllo 😀") }')).toBe('{\n  field(arg: "héllo 😀")\n}');
  });

  it('preserves escape sequences inside string arguments', () => {
    // A literal backslash-n in source becomes a real newline in the value,
    // which print re-escapes back to \n
    expect(fmt('{ f(a: "x\\ny") }')).toBe('{\n  f(a: "x\\ny")\n}');
  });

  it('formats list and object literal arguments with canonical spacing', () => {
    expect(fmt('{ f(n: [1,2,3]) }')).toBe('{\n  f(n: [1, 2, 3])\n}');
    expect(fmt('{ f(n: {a:1,b:2}) }')).toBe('{\n  f(n: {a: 1, b: 2})\n}');
  });

  it('preserves null literal arguments', () => {
    expect(fmt('{ f(n: null) }')).toBe('{\n  f(n: null)\n}');
  });

  it('preserves negative and exponential numeric literals verbatim', () => {
    expect(fmt('{ f(n: -0) }')).toBe('{\n  f(n: -0)\n}');
    expect(fmt('{ f(n: 1.5e10) }')).toBe('{\n  f(n: 1.5e10)\n}');
  });

  it('is idempotent: formatting an already-formatted document is a no-op', () => {
    const once = fmt('query{a b{c}}');
    expect(fmt(once)).toBe(once);
  });

  it('is deterministic: repeated calls produce identical output', () => {
    const a = fmt('type X{a:Int}');
    const b = fmt('type X{a:Int}');
    expect(a).toBe(b);
  });

  it('handles a large input without crashing and keeps every field', () => {
    const fields = Array.from({ length: 500 }, (_, i) => `f${i}`);
    const input = `{ ${fields.join(' ')} }`;
    const out = fmt(input);
    expect(out.startsWith('{')).toBe(true);
    expect(out.endsWith('}')).toBe(true);
    for (const f of fields) expect(out).toContain(f);
  });

  it('throws on an empty string', () => {
    expect(() => fmt('')).toThrow();
  });

  it('throws on a whitespace-only string', () => {
    expect(() => fmt('   \n\t  ')).toThrow();
  });

  it('throws on an unclosed brace', () => {
    expect(() => fmt('{')).toThrow();
  });

  it('throws on a syntactically invalid type name', () => {
    expect(() => fmt('type 123 {}')).toThrow();
  });

  it('reports a meaningful Syntax Error message instead of crashing', () => {
    expect(() => fmt('{')).toThrow(/Syntax Error/);
  });

  it('attaches the original parse error as the cause', () => {
    try {
      fmt('{');
      expect.unreachable('expected fmt to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).cause).toBeDefined();
    }
  });
});
