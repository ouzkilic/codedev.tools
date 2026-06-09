import { describe, it, expect } from 'vitest';
import { jsonToEnvLogic } from './logic';

describe('jsonToEnv', () => {
  // --- existing assertions (kept) ---
  it('writes KEY=VALUE lines', () => {
    expect(jsonToEnvLogic.transform('{"A":1,"B":"hello"}')).toBe('A=1\nB=hello');
  });
  it('quotes values with spaces', () => {
    expect(jsonToEnvLogic.transform('{"A":"hello world"}')).toBe('A="hello world"');
  });
  it('serializes nested objects as JSON', () => {
    expect(jsonToEnvLogic.transform('{"A":{"x":1}}')).toContain('A=');
  });
  it('throws on a non-object root', () => {
    expect(() => jsonToEnvLogic.transform('[1,2]')).toThrow();
  });

  // --- happy paths ---
  it('renders a single string key without special chars unquoted', () => {
    expect(jsonToEnvLogic.transform('{"FOO":"bar"}')).toBe('FOO=bar');
  });

  it('joins multiple entries with newlines preserving insertion order', () => {
    expect(jsonToEnvLogic.transform('{"A":1,"B":2,"C":3}')).toBe('A=1\nB=2\nC=3');
  });

  it('returns an empty string for an empty object', () => {
    expect(jsonToEnvLogic.transform('{}')).toBe('');
  });

  // --- value type branches ---
  it('renders booleans via String()', () => {
    expect(jsonToEnvLogic.transform('{"T":true,"F":false}')).toBe('T=true\nF=false');
  });

  it('renders null as an empty value', () => {
    expect(jsonToEnvLogic.transform('{"A":null}')).toBe('A=');
  });

  it('renders integer numbers including zero and negatives', () => {
    expect(jsonToEnvLogic.transform('{"Z":0,"N":-5,"P":42}')).toBe('Z=0\nN=-5\nP=42');
  });

  it('renders floating point numbers', () => {
    expect(jsonToEnvLogic.transform('{"PI":3.14}')).toBe('PI=3.14');
  });

  it('serializes nested objects as compact JSON and quotes them (contains quotes)', () => {
    // JSON.stringify({x:1}) === '{"x":1}' which contains '"', triggering quoting + escaping
    expect(jsonToEnvLogic.transform('{"A":{"x":1}}')).toBe('A="{\\"x\\":1}"');
  });

  it('serializes array values as JSON; simple numeric arrays need no quoting', () => {
    // JSON.stringify([1,2,3]) === '[1,2,3]' — no whitespace/#/"/=/' so left unquoted
    expect(jsonToEnvLogic.transform('{"A":[1,2,3]}')).toBe('A=[1,2,3]');
  });

  it('quotes array values that contain strings (because of the quote chars)', () => {
    // JSON.stringify(["a"]) === '["a"]' contains '"'
    expect(jsonToEnvLogic.transform('{"A":["a"]}')).toBe('A="[\\"a\\"]"');
  });

  // --- quoting trigger characters ---
  it('quotes values containing equals signs', () => {
    expect(jsonToEnvLogic.transform('{"A":"a=b"}')).toBe('A="a=b"');
  });

  it('quotes values containing a hash', () => {
    expect(jsonToEnvLogic.transform('{"A":"a#b"}')).toBe('A="a#b"');
  });

  it('quotes values containing a single quote', () => {
    expect(jsonToEnvLogic.transform('{"A":"it\'s"}')).toBe('A="it\'s"');
  });

  it('quotes values containing tabs and newlines (whitespace class)', () => {
    expect(jsonToEnvLogic.transform('{"A":"a\\tb"}')).toBe('A="a\tb"');
  });

  it('quotes and escapes embedded double quotes', () => {
    // input value is: say "hi"
    expect(jsonToEnvLogic.transform('{"A":"say \\"hi\\""}')).toBe('A="say \\"hi\\""');
  });

  it('does not quote a plain alphanumeric/underscore value', () => {
    expect(jsonToEnvLogic.transform('{"DB_URL":"localhost_5432"}')).toBe('DB_URL=localhost_5432');
  });

  // --- unicode / emoji ---
  it('handles unicode and emoji, quoting when whitespace present', () => {
    expect(jsonToEnvLogic.transform('{"A":"José 🚀"}')).toBe('A="José 🚀"');
  });

  it('keeps unicode without whitespace unquoted', () => {
    expect(jsonToEnvLogic.transform('{"A":"José"}')).toBe('A=José');
  });

  // --- empty string value ---
  it('renders an empty string value without quotes', () => {
    expect(jsonToEnvLogic.transform('{"A":""}')).toBe('A=');
  });

  it('quotes a value that is only spaces', () => {
    expect(jsonToEnvLogic.transform('{"A":"   "}')).toBe('A="   "');
  });

  // --- determinism ---
  it('is deterministic for the same input', () => {
    const input = '{"A":1,"B":"x y","C":null}';
    expect(jsonToEnvLogic.transform(input)).toBe(jsonToEnvLogic.transform(input));
  });

  // --- large input ---
  it('handles a large object', () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 500; i++) obj[`KEY_${i}`] = i;
    const out = jsonToEnvLogic.transform(JSON.stringify(obj));
    const lines = out.split('\n');
    expect(lines).toHaveLength(500);
    expect(lines[0]).toBe('KEY_0=0');
    expect(lines[499]).toBe('KEY_499=499');
  });

  // --- error paths ---
  it('throws on malformed JSON', () => {
    expect(() => jsonToEnvLogic.transform('{not json}')).toThrow();
  });

  it('throws on an empty input string', () => {
    expect(() => jsonToEnvLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => jsonToEnvLogic.transform('   \n  ')).toThrow();
  });

  it('throws with the flat-object message for a JSON null root', () => {
    expect(() => jsonToEnvLogic.transform('null')).toThrow('Input must be a flat JSON object.');
  });

  it('throws with the flat-object message for a JSON number root', () => {
    expect(() => jsonToEnvLogic.transform('42')).toThrow('Input must be a flat JSON object.');
  });

  it('throws with the flat-object message for a JSON string root', () => {
    expect(() => jsonToEnvLogic.transform('"hello"')).toThrow('Input must be a flat JSON object.');
  });

  it('throws with the flat-object message for an array root', () => {
    expect(() => jsonToEnvLogic.transform('[1,2,3]')).toThrow('Input must be a flat JSON object.');
  });

  it('throws with the flat-object message for a boolean root', () => {
    expect(() => jsonToEnvLogic.transform('true')).toThrow('Input must be a flat JSON object.');
  });
});
