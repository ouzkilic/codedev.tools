import { describe, it, expect } from 'vitest';
import { envToJsonLogic } from './logic';

const toObj = (s: string): Record<string, string> =>
  JSON.parse(envToJsonLogic.transform(s)) as Record<string, string>;

describe('envToJson', () => {
  it('parses KEY=VALUE pairs', () => {
    expect(toObj('A=1\nB=hello')).toEqual({ A: '1', B: 'hello' });
  });

  it('skips comments and blank lines', () => {
    expect(toObj('# comment\n\nA=1')).toEqual({ A: '1' });
  });

  it('strips surrounding double and single quotes', () => {
    expect(toObj('A="hello world"\nB=\'x\'')).toEqual({ A: 'hello world', B: 'x' });
  });

  it('drops an export prefix', () => {
    expect(toObj('export A=1')).toEqual({ A: '1' });
  });

  it('returns an empty object for empty input', () => {
    expect(envToJsonLogic.transform('')).toBe('{}');
    expect(toObj('')).toEqual({});
  });

  it('returns an empty object for whitespace-only input', () => {
    expect(toObj('   \n\t\n  ')).toEqual({});
  });

  it('returns an empty object when only comments are present', () => {
    expect(toObj('# one\n# two\n   # indented comment')).toEqual({});
  });

  it('skips lines without an equals sign', () => {
    expect(toObj('JUST_A_KEY\nA=1\nanother line')).toEqual({ A: '1' });
  });

  it('keeps an empty value when the line ends right after equals', () => {
    expect(toObj('A=')).toEqual({ A: '' });
  });

  it('splits only on the first equals sign', () => {
    expect(toObj('A=b=c=d')).toEqual({ A: 'b=c=d' });
  });

  it('preserves a connection-string style value with equals signs', () => {
    expect(toObj('DSN=Server=db;User Id=admin;Pwd=secret')).toEqual({
      DSN: 'Server=db;User Id=admin;Pwd=secret',
    });
  });

  it('trims surrounding whitespace from keys and values', () => {
    expect(toObj('  A  =  1  ')).toEqual({ A: '1' });
  });

  it('handles export with extra spaces before the key', () => {
    expect(toObj('export   A=1')).toEqual({ A: '1' });
  });

  it('strips export even when there is leading whitespace on the line', () => {
    expect(toObj('   export A=foo')).toEqual({ A: 'foo' });
  });

  it('does not strip export when it is not a prefix (e.g. exporter)', () => {
    expect(toObj('exportA=1')).toEqual({ exportA: '1' });
    expect(toObj('exporter=1')).toEqual({ exporter: '1' });
  });

  it('does not treat an inline hash as a comment', () => {
    expect(toObj('A=value # not a comment')).toEqual({ A: 'value # not a comment' });
  });

  it('does not strip mismatched quotes', () => {
    expect(toObj('A="x\'')).toEqual({ A: '"x\'' });
  });

  it('does not strip a quote that only appears at one end', () => {
    expect(toObj('A="x\nB=y"')).toEqual({ A: '"x', B: 'y"' });
  });

  it('preserves quote characters inside an unquoted value', () => {
    expect(toObj('A=he said "hi"')).toEqual({ A: 'he said "hi"' });
  });

  it('keeps inner quotes when stripping only the outer pair', () => {
    expect(toObj('A="say \'hi\'"')).toEqual({ A: "say 'hi'" });
  });

  it('lets the last assignment win for duplicate keys', () => {
    expect(toObj('A=1\nA=2\nA=3')).toEqual({ A: '3' });
  });

  it('handles unicode and emoji in keys and values', () => {
    expect(toObj('GRÜßE=héllo 🌍\nKEY=日本語')).toEqual({
      'GRÜßE': 'héllo 🌍',
      KEY: '日本語',
    });
  });

  it('parses many entries from a large input deterministically', () => {
    const lines = Array.from({ length: 500 }, (_, i) => `KEY_${i}=val_${i}`);
    const obj = toObj(lines.join('\n'));
    expect(Object.keys(obj)).toHaveLength(500);
    expect(obj.KEY_0).toBe('val_0');
    expect(obj.KEY_499).toBe('val_499');
  });

  it('handles values that are numbers, negatives and zero as strings', () => {
    expect(toObj('A=0\nB=-42\nC=3.14')).toEqual({ A: '0', B: '-42', C: '3.14' });
  });

  it('handles leading and trailing blank/separator lines', () => {
    expect(toObj('\n\nA=1\n\nB=2\n\n')).toEqual({ A: '1', B: '2' });
  });

  it('produces valid 2-space indented JSON', () => {
    const out = envToJsonLogic.transform('A=1\nB=2');
    expect(out).toBe('{\n  "A": "1",\n  "B": "2"\n}');
  });

  it('is deterministic for identical input', () => {
    const input = 'X=1\nY=two\nexport Z="three"';
    expect(envToJsonLogic.transform(input)).toBe(envToJsonLogic.transform(input));
  });

  it('handles CRLF lines by keeping carriage returns trimmed off', () => {
    // \r is whitespace, so trim() removes it; key/value stay clean.
    expect(toObj('A=1\r\nB=2\r\n')).toEqual({ A: '1', B: '2' });
  });

  it('treats an empty double-quote pair as an empty string', () => {
    expect(toObj('A=""')).toEqual({ A: '' });
  });
});
