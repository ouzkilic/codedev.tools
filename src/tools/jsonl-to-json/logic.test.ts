import { describe, it, expect } from 'vitest';
import { jsonlToJsonLogic } from './logic';

const t = (input: string) => jsonlToJsonLogic.transform(input);

describe('jsonlToJson', () => {
  it('parses each line into an array', () => {
    expect(JSON.parse(t('{"a":1}\n{"b":2}'))).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it('ignores blank lines and surrounding whitespace', () => {
    expect(JSON.parse(t('  {"a":1}  \n\n{"b":2}\n'))).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it('reports the offending line number on bad input', () => {
    expect(() => t('{"a":1}\n{bad}')).toThrow(/line 2/);
  });

  it('returns a pretty-printed JSON string (2-space indent)', () => {
    const out = t('{"a":1}');
    expect(out).toBe('[\n  {\n    "a": 1\n  }\n]');
  });

  it('produces valid JSON that round-trips back to the parsed values', () => {
    const out = t('{"x":10}\n{"y":20}\n{"z":30}');
    expect(JSON.parse(out)).toEqual([{ x: 10 }, { y: 20 }, { z: 30 }]);
  });

  it('handles a single object with no newline', () => {
    expect(JSON.parse(t('{"only":true}'))).toEqual([{ only: true }]);
  });

  it('returns an empty array for an empty string', () => {
    expect(t('')).toBe('[]');
    expect(JSON.parse(t(''))).toEqual([]);
  });

  it('returns an empty array for whitespace-only input', () => {
    expect(JSON.parse(t('   \n\t\n   \n'))).toEqual([]);
  });

  it('returns an empty array for input that is only newlines', () => {
    expect(JSON.parse(t('\n\n\n'))).toEqual([]);
  });

  it('ignores leading and trailing blank lines', () => {
    expect(JSON.parse(t('\n\n{"a":1}\n\n{"b":2}\n\n'))).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it('parses scalar JSON values per line (numbers, strings, booleans, null)', () => {
    expect(JSON.parse(t('1\n"hello"\ntrue\nfalse\nnull'))).toEqual([
      1,
      'hello',
      true,
      false,
      null,
    ]);
  });

  it('parses arrays per line', () => {
    expect(JSON.parse(t('[1,2,3]\n[4,5]'))).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });

  it('parses nested objects and preserves structure', () => {
    const input = '{"a":{"b":{"c":[1,2]}}}\n{"d":null}';
    expect(JSON.parse(t(input))).toEqual([{ a: { b: { c: [1, 2] } } }, { d: null }]);
  });

  it('preserves unicode and emoji content', () => {
    const input = '{"msg":"héllo 世界"}\n{"emoji":"😀🚀"}';
    expect(JSON.parse(t(input))).toEqual([{ msg: 'héllo 世界' }, { emoji: '😀🚀' }]);
  });

  it('preserves special characters within JSON strings', () => {
    const input = '{"s":"tab\\tnewline\\nquote\\"backslash\\\\"}';
    expect(JSON.parse(t(input))).toEqual([{ s: 'tab\tnewline\nquote"backslash\\' }]);
  });

  it('handles numeric boundary values (zero, negative, float, exponent)', () => {
    const input = '{"v":0}\n{"v":-42}\n{"v":3.14}\n{"v":1e21}';
    expect(JSON.parse(t(input))).toEqual([
      { v: 0 },
      { v: -42 },
      { v: 3.14 },
      { v: 1e21 },
    ]);
  });

  it('handles large integers near MAX_SAFE_INTEGER', () => {
    const input = `{"v":${Number.MAX_SAFE_INTEGER}}`;
    expect(JSON.parse(t(input))).toEqual([{ v: Number.MAX_SAFE_INTEGER }]);
  });

  it('handles a large number of lines deterministically', () => {
    const count = 1000;
    const lines = Array.from({ length: count }, (_, i) => `{"i":${i}}`);
    const parsed = JSON.parse(t(lines.join('\n'))) as Array<{ i: number }>;
    expect(parsed).toHaveLength(count);
    expect(parsed[0]).toEqual({ i: 0 });
    expect(parsed[count - 1]).toEqual({ i: count - 1 });
  });

  it('reports line 1 when the very first line is malformed', () => {
    expect(() => t('{nope}\n{"a":1}')).toThrow(/line 1/);
  });

  it('reports the correct line number ignoring blank lines before the error', () => {
    // Blank lines are filtered before indexing, so the error line index is
    // relative to the kept (non-empty) lines, not the original text.
    expect(() => t('{"a":1}\n\n\nbad')).toThrow(/line 2/);
  });

  it('throws on a bare unquoted token', () => {
    expect(() => t('undefined')).toThrow(/line 1/);
  });

  it('throws on trailing comma (invalid JSON)', () => {
    expect(() => t('{"a":1,}')).toThrow(/Invalid JSON/);
  });

  it('throws on single-quoted strings (invalid JSON)', () => {
    expect(() => t("{'a':1}")).toThrow(/Invalid JSON/);
  });

  it('throws when a later line is malformed and aborts the whole transform', () => {
    expect(() => t('{"a":1}\n{"b":2}\noops')).toThrow(/line 3/);
  });

  it('treats \\r as part of the trimmed token so CRLF input still parses', () => {
    // trim() strips \r, so Windows line endings are handled.
    expect(JSON.parse(t('{"a":1}\r\n{"b":2}\r\n'))).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it('is deterministic: same input yields identical output across calls', () => {
    const input = '{"a":1}\n{"b":[2,3]}\n"x"';
    expect(t(input)).toBe(t(input));
  });

  it('output parsed and re-stringified is stable (idempotent on its own array form)', () => {
    const input = '{"a":1}\n{"b":2}';
    const once = t(input);
    const arr = JSON.parse(once);
    // Feeding the produced array back as a single JSONL line yields a 1-element wrapper.
    expect(JSON.parse(t(JSON.stringify(arr)))).toEqual([[{ a: 1 }, { b: 2 }]]);
  });
});
