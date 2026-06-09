import { describe, it, expect } from 'vitest';
import { jsonToCsvLogic } from './logic';

const t = (input: string) => jsonToCsvLogic.transform(input);

describe('jsonToCsv', () => {
  // --- happy paths -------------------------------------------------------
  it('writes a header row plus data rows', () => {
    expect(t('[{"a":1,"b":2},{"a":3,"b":4}]')).toBe('a,b\n1,2\n3,4');
  });

  it('emits a single header + row for one object', () => {
    expect(t('[{"name":"Ada","age":36}]')).toBe('name,age\nAda,36');
  });

  it('preserves header column order from the first object', () => {
    expect(t('[{"z":1,"a":2,"m":3}]')).toBe('z,a,m\n1,2,3');
  });

  it('keeps unicode and emoji bytes intact without quoting', () => {
    expect(t('[{"a":"café 🚀"}]')).toBe('a\ncafé 🚀');
  });

  // --- quoting / escaping rules -----------------------------------------
  it('quotes values containing commas', () => {
    expect(t('[{"a":"x,y"}]')).toBe('a\n"x,y"');
  });

  it('quotes values containing embedded newlines', () => {
    expect(t('[{"a":"line1\\nline2"}]')).toBe('a\n"line1\nline2"');
  });

  it('escapes embedded double quotes by doubling them and wrapping', () => {
    expect(t('[{"a":"he said \\"hi\\""}]')).toBe('a\n"he said ""hi"""');
  });

  it('preserves leading and trailing whitespace by quoting', () => {
    expect(t('[{"a":"  x  "}]')).toBe('a\n"  x  "');
  });

  it('does not quote values containing only semicolons or tabs (delimiter is comma)', () => {
    expect(t('[{"a":"x;y"}]')).toBe('a\nx;y');
    expect(t('[{"a":"x\\ty"}]')).toBe('a\nx\ty');
  });

  // --- scalar / typed values --------------------------------------------
  it('renders booleans and null (null becomes empty field)', () => {
    expect(t('[{"a":true,"b":false,"c":null}]')).toBe('a,b,c\ntrue,false,');
  });

  it('renders zero and negative zero both as 0', () => {
    expect(t('[{"n":0},{"n":-0}]')).toBe('n\n0\n0');
  });

  it('renders fractional and large numbers in JS number form', () => {
    expect(t('[{"n":0.1},{"n":1e21}]')).toBe('n\n0.1\n1e+21');
  });

  it('renders negative numbers verbatim', () => {
    expect(t('[{"n":-42.5}]')).toBe('n\n-42.5');
  });

  // --- nested structures -------------------------------------------------
  it('stringifies nested objects as [object Object]', () => {
    expect(t('[{"a":{"x":1}}]')).toBe('a\n[object Object]');
  });

  it('joins array-valued fields and quotes them due to internal commas', () => {
    expect(t('[{"a":[1,2,3]}]')).toBe('a\n"1,2,3"');
  });

  // --- ragged / sparse rows ---------------------------------------------
  it('uses only the first object keys; missing later keys yield empty fields', () => {
    // Papa unparse takes the field set from the first row; {b:2} has no 'a'.
    expect(t('[{"a":1},{"b":2}]')).toBe('a\n1\n');
  });

  it('emits a trailing newline (empty row) for objects with no keys', () => {
    expect(t('[{},{}]')).toBe('\n');
  });

  // --- empty input -------------------------------------------------------
  it('returns an empty string for an empty array', () => {
    expect(t('[]')).toBe('');
  });

  // --- output normalization / determinism -------------------------------
  it('normalizes CRLF row separators to LF only (no carriage returns)', () => {
    const out = t('[{"a":1,"b":2},{"a":3,"b":4}]');
    expect(out).not.toContain('\r');
    expect(out.split('\n')).toHaveLength(3);
  });

  it('is deterministic for repeated calls on the same input', () => {
    const input = '[{"a":"x,y","b":"q\\"q"}]';
    expect(t(input)).toBe(t(input));
  });

  // --- error paths -------------------------------------------------------
  it('throws when input is a JSON object, not an array', () => {
    expect(() => t('{"a":1}')).toThrow(/array/i);
  });

  it('throws when input is a JSON scalar (number / string / bool)', () => {
    expect(() => t('42')).toThrow(/array/i);
    expect(() => t('"hello"')).toThrow(/array/i);
    expect(() => t('true')).toThrow(/array/i);
    expect(() => t('null')).toThrow(/array/i);
  });

  it('throws on invalid JSON', () => {
    expect(() => t('[bad]')).toThrow();
  });

  it('throws on empty / whitespace-only input (invalid JSON)', () => {
    expect(() => t('')).toThrow();
    expect(() => t('   ')).toThrow();
  });

  it('throws when array contains unserializable scalar items', () => {
    // Papa cannot serialize an array of plain scalars into rows.
    expect(() => t('[1,2,3]')).toThrow(/serialize/i);
    expect(() => t('["a","b"]')).toThrow(/serialize/i);
  });
});
