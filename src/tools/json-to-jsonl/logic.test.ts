import { describe, it, expect } from 'vitest';
import { jsonToJsonlLogic } from './logic';

const transform = (input: string) => jsonToJsonlLogic.transform(input);

describe('jsonToJsonl', () => {
  it('emits one compact line per array element', () => {
    expect(transform('[{"a":1},{"b":2}]')).toBe('{"a":1}\n{"b":2}');
  });

  it('handles primitive elements', () => {
    expect(transform('[1,"x",true,null]')).toBe('1\n"x"\ntrue\nnull');
  });

  it('returns empty string for an empty array', () => {
    expect(transform('[]')).toBe('');
  });

  it('returns empty string for an array with whitespace inside brackets', () => {
    expect(transform('[   ]')).toBe('');
    expect(transform('[\n\t ]')).toBe('');
  });

  it('emits a single line for a one-element array (no trailing newline)', () => {
    const out = transform('[{"only":true}]');
    expect(out).toBe('{"only":true}');
    expect(out).not.toContain('\n');
  });

  it('produces (length - 1) newline separators for N elements', () => {
    const out = transform('[1,2,3,4,5]');
    expect(out.split('\n')).toHaveLength(5);
    expect((out.match(/\n/g) ?? []).length).toBe(4);
  });

  it('compacts pretty-printed JSON input into single lines', () => {
    const input = `[
      {
        "name": "alice",
        "age": 30
      },
      {
        "name": "bob",
        "age": 25
      }
    ]`;
    expect(transform(input)).toBe('{"name":"alice","age":30}\n{"name":"bob","age":25}');
  });

  it('preserves object key order as parsed', () => {
    expect(transform('[{"z":1,"a":2,"m":3}]')).toBe('{"z":1,"a":2,"m":3}');
  });

  it('handles nested objects and arrays compactly', () => {
    expect(transform('[{"a":{"b":[1,2,{"c":3}]}}]')).toBe('{"a":{"b":[1,2,{"c":3}]}}');
  });

  it('emits empty objects and empty arrays as elements', () => {
    expect(transform('[{},[],{}]')).toBe('{}\n[]\n{}');
  });

  it('handles null elements explicitly', () => {
    expect(transform('[null,null]')).toBe('null\nnull');
  });

  it('preserves unicode and emoji in string values', () => {
    const out = transform('["héllo","世界","😀🎉"]');
    expect(out).toBe('"héllo"\n"世界"\n"😀🎉"');
  });

  it('escapes special characters via JSON.stringify', () => {
    // A string containing a real newline + quote + backslash + tab.
    const input = JSON.stringify(['line1\nline2', 'quote"here', 'back\\slash', 'tab\tend']);
    const out = transform(input);
    expect(out).toBe('"line1\\nline2"\n"quote\\"here"\n"back\\\\slash"\n"tab\\tend"');
    // Each element stays on its own single output line (embedded newline is escaped).
    expect(out.split('\n')).toHaveLength(4);
  });

  it('handles number boundaries: negative, zero, floats, exponentials', () => {
    expect(transform('[-1,0,3.14,1e10,-2.5e-3]')).toBe('-1\n0\n3.14\n10000000000\n-0.0025');
  });

  it('handles large integers within safe range', () => {
    expect(transform('[9007199254740991]')).toBe('9007199254740991');
  });

  it('handles a large array (1000 elements) deterministically', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const out = transform(JSON.stringify(arr));
    const lines = out.split('\n');
    expect(lines).toHaveLength(1000);
    expect(lines[0]).toBe('0');
    expect(lines[999]).toBe('999');
  });

  it('drops undefined-producing values the way JSON.stringify does (functions n/a, but keys stay)', () => {
    // JSON input can't carry undefined; ensure object with null value is kept.
    expect(transform('[{"a":null,"b":1}]')).toBe('{"a":null,"b":1}');
  });

  it('is deterministic / idempotent in the sense that re-running gives the same output', () => {
    const input = '[{"a":1},{"b":2},{"c":3}]';
    expect(transform(input)).toBe(transform(input));
  });

  it('round-trips: each output line parses back to the original element', () => {
    const original = [{ a: 1 }, [1, 2], 'str', 42, true, null];
    const out = transform(JSON.stringify(original));
    const reparsed = out.split('\n').map((l) => JSON.parse(l));
    expect(reparsed).toEqual(original);
  });

  it('throws when input is a JSON object (not an array)', () => {
    expect(() => transform('{"a":1}')).toThrow(/array/i);
  });

  it('throws when input is a bare JSON primitive', () => {
    expect(() => transform('42')).toThrow(/array/i);
    expect(() => transform('"hello"')).toThrow(/array/i);
    expect(() => transform('true')).toThrow(/array/i);
    expect(() => transform('null')).toThrow(/array/i);
  });

  it('throws on invalid JSON', () => {
    expect(() => transform('[bad]')).toThrow();
  });

  it('throws on empty string input', () => {
    expect(() => transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => transform('   \n\t  ')).toThrow();
  });

  it('throws on trailing-comma / malformed array', () => {
    expect(() => transform('[1,2,]')).toThrow();
  });

  it('throws on an unterminated array', () => {
    expect(() => transform('[1,2')).toThrow();
  });
});
