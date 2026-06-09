import { describe, it, expect } from 'vitest';
import { jsonRepairLogic } from './logic';

const t = (input: string) => jsonRepairLogic.transform(input);

describe('jsonRepair', () => {
  // --- existing assertions (kept) ---
  it('quotes unquoted keys', () => {
    expect(t('{a:1}')).toBe('{\n  "a": 1\n}');
  });
  it('removes trailing commas', () => {
    expect(t('{"a":1,}')).toBe('{\n  "a": 1\n}');
  });
  it('converts single quotes to double quotes', () => {
    expect(t("{'a':'b'}")).toBe('{\n  "a": "b"\n}');
  });
  it('leaves valid JSON intact (idempotent)', () => {
    const valid = '{\n  "a": 1\n}';
    expect(t(valid)).toBe(valid);
  });
  it('throws on empty input', () => {
    expect(() => t('')).toThrow();
  });

  // --- structural pretty-printing ---
  it('pretty-prints with two-space indentation', () => {
    expect(t('{"a":1,"b":2}')).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });
  it('removes trailing comma from arrays', () => {
    expect(t('[1,2,3,]')).toBe('[\n  1,\n  2,\n  3\n]');
  });
  it('handles deeply nested structures with mixed repairs', () => {
    expect(t('{"nested": {"a": [1, {b: 2,},]}}')).toBe(
      '{\n  "nested": {\n    "a": [\n      1,\n      {\n        "b": 2\n      }\n    ]\n  }\n}',
    );
  });
  it('pretty-prints already-formatted multi-key object unchanged (idempotent)', () => {
    const valid = '{\n  "a": 1,\n  "b": 2\n}';
    expect(t(valid)).toBe(valid);
  });

  // --- comments stripping ---
  it('strips line comments', () => {
    expect(t('// comment\n{"a":1}')).toBe('{\n  "a": 1\n}');
  });
  it('strips block comments', () => {
    expect(t('/* block */ {"a":1}')).toBe('{\n  "a": 1\n}');
  });

  // --- python-style literals ---
  it('converts Python True/False/None to JSON', () => {
    expect(t('{"a": True, "b": False, "c": None}')).toBe(
      '{\n  "a": true,\n  "b": false,\n  "c": null\n}',
    );
  });
  it('converts undefined to null', () => {
    expect(t('{"a": undefined}')).toBe('{\n  "a": null\n}');
  });

  // --- missing separators ---
  it('inserts missing commas between array values', () => {
    expect(t('[1 2 3]')).toBe('[\n  1,\n  2,\n  3\n]');
  });
  it('inserts missing commas between object members', () => {
    expect(t('{"a": 1 "b": 2}')).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  // --- unclosed / truncated input is recovered ---
  it('closes an unclosed array', () => {
    expect(t('[1,2,3')).toBe('[\n  1,\n  2,\n  3\n]');
  });
  it('closes an unclosed object', () => {
    expect(t('{"a":1')).toBe('{\n  "a": 1\n}');
  });
  it('closes an unclosed string', () => {
    expect(t('{"unclosed": "str}')).toBe('{\n  "unclosed": "str"\n}');
  });

  // --- string content & escaping ---
  it('preserves a single quote inside a double-quoted string', () => {
    expect(t('{"name": "O\'Brien"}')).toBe('{\n  "name": "O\'Brien"\n}');
  });
  it('unescapes an escaped single quote when converting from single quotes', () => {
    expect(t("{'a': 'b\\'c'}")).toBe('{\n  "a": "b\'c"\n}');
  });
  it('preserves unicode / emoji characters', () => {
    expect(t('{"emoji": "😀🚀"}')).toBe('{\n  "emoji": "😀🚀"\n}');
  });

  // --- scalar / non-object roots ---
  it('handles a bare string root', () => {
    expect(t('"hello"')).toBe('"hello"');
  });
  it('handles a bare number root', () => {
    expect(t('42')).toBe('42');
  });
  it('handles bare boolean and null roots', () => {
    expect(t('true')).toBe('true');
    expect(t('null')).toBe('null');
  });
  it('wraps unquoted bare text into a JSON string', () => {
    expect(t('not json at all')).toBe('"not json at all"');
  });
  it('handles empty object and array roots', () => {
    expect(t('{}')).toBe('{}');
    expect(t('[]')).toBe('[]');
  });

  // --- number boundaries ---
  it('handles zero and negative zero (normalized to 0)', () => {
    expect(t('{"a": 0}')).toBe('{\n  "a": 0\n}');
    expect(t('{"a": -0}')).toBe('{\n  "a": 0\n}');
  });
  it('handles negative numbers', () => {
    expect(t('{"a": -5}')).toBe('{\n  "a": -5\n}');
  });
  it('expands exponential notation', () => {
    expect(t('{"a": 1e10}')).toBe('{\n  "a": 10000000000\n}');
  });
  it('trims a dangling decimal point', () => {
    expect(t('{"a": 5.}')).toBe('{\n  "a": 5\n}');
  });

  // --- special float literals become strings (JSON has no NaN/Infinity) ---
  it('stringifies NaN since JSON has no NaN literal', () => {
    expect(t('{"a": NaN}')).toBe('{\n  "a": "NaN"\n}');
  });
  it('stringifies Infinity since JSON has no Infinity literal', () => {
    expect(t('{"a": Infinity}')).toBe('{\n  "a": "Infinity"\n}');
  });

  // --- duplicate keys: last wins ---
  it('keeps the last value for duplicate keys', () => {
    expect(t('{"dup": 1, "dup": 2}')).toBe('{\n  "dup": 2\n}');
  });

  // --- large input determinism ---
  it('repairs a large array deterministically and idempotently', () => {
    const items = Array.from({ length: 500 }, (_, i) => i);
    const broken = `[${items.join(' ')},]`; // missing commas + trailing comma
    const once = t(broken);
    const parsed: unknown = JSON.parse(once);
    expect(parsed).toEqual(items);
    expect(t(once)).toBe(once); // idempotent on its own output
  });

  // --- error paths ---
  it('throws on whitespace-only input', () => {
    expect(() => t('   ')).toThrow();
  });
  it('throws on a leading-decimal number it cannot repair', () => {
    expect(() => t('{"a": .5}')).toThrow();
  });
  it('throws on multiple top-level values', () => {
    expect(() => t('{a:1}{b:2}')).toThrow();
  });
});
