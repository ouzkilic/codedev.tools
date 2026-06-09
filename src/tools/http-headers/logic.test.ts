import { describe, it, expect } from 'vitest';
import { httpHeadersLogic } from './logic';

describe('httpHeaders', () => {
  // --- existing assertions (kept) ---
  it('parses headers into JSON', () => {
    const out = httpHeadersLogic.transform('Content-Type: text/html\nX-Foo: bar');
    expect(JSON.parse(out)).toEqual({ 'Content-Type': 'text/html', 'X-Foo': 'bar' });
  });

  it('skips the request/status line', () => {
    const out = httpHeadersLogic.transform('GET / HTTP/1.1\nContent-Type: text/html\nX-Foo: bar');
    expect(JSON.parse(out)).toEqual({ 'Content-Type': 'text/html', 'X-Foo': 'bar' });
  });

  it('throws when no headers found', () => {
    expect(() => httpHeadersLogic.transform('nope')).toThrow('No headers found.');
  });

  // --- output formatting ---
  it('produces 2-space pretty-printed JSON', () => {
    const out = httpHeadersLogic.transform('A: 1');
    expect(out).toBe('{\n  "A": "1"\n}');
  });

  it('returns a string that round-trips through JSON.parse', () => {
    const out = httpHeadersLogic.transform('Accept: */*');
    expect(typeof out).toBe('string');
    expect(JSON.parse(out)).toEqual({ Accept: '*/*' });
  });

  // --- single header ---
  it('parses a single header', () => {
    const out = httpHeadersLogic.transform('Host: example.com');
    expect(JSON.parse(out)).toEqual({ Host: 'example.com' });
  });

  // --- trimming behaviour ---
  it('trims surrounding whitespace from keys and values', () => {
    const out = httpHeadersLogic.transform('   Content-Type   :    text/plain   ');
    expect(JSON.parse(out)).toEqual({ 'Content-Type': 'text/plain' });
  });

  it('trims whitespace from each line before parsing', () => {
    const out = httpHeadersLogic.transform('\t  X-Test: yes  \t');
    expect(JSON.parse(out)).toEqual({ 'X-Test': 'yes' });
  });

  it('ignores blank lines between headers', () => {
    const out = httpHeadersLogic.transform('A: 1\n\n\n   \nB: 2');
    expect(JSON.parse(out)).toEqual({ A: '1', B: '2' });
  });

  it('handles leading and trailing newlines', () => {
    const out = httpHeadersLogic.transform('\n\nContent-Length: 42\n\n');
    expect(JSON.parse(out)).toEqual({ 'Content-Length': '42' });
  });

  // --- colon edge cases ---
  it('only splits on the first colon, preserving colons in the value', () => {
    const out = httpHeadersLogic.transform('Location: https://example.com:8080/path');
    expect(JSON.parse(out)).toEqual({ Location: 'https://example.com:8080/path' });
  });

  it('skips lines whose colon is at the start (i < 1)', () => {
    // ':value' has colon at index 0 -> skipped; Valid stays
    const out = httpHeadersLogic.transform(':leading\nValid: ok');
    expect(JSON.parse(out)).toEqual({ Valid: 'ok' });
  });

  it('keeps a header with an empty value', () => {
    const out = httpHeadersLogic.transform('X-Empty:');
    expect(JSON.parse(out)).toEqual({ 'X-Empty': '' });
  });

  it('keeps a header with an empty value followed by whitespace', () => {
    const out = httpHeadersLogic.transform('X-Empty:    ');
    expect(JSON.parse(out)).toEqual({ 'X-Empty': '' });
  });

  // --- duplicate keys ---
  it('last duplicate key wins', () => {
    const out = httpHeadersLogic.transform('Set-Cookie: a=1\nSet-Cookie: b=2');
    expect(JSON.parse(out)).toEqual({ 'Set-Cookie': 'b=2' });
  });

  // --- multiple headers, ordering ---
  it('preserves insertion order of distinct keys', () => {
    const out = httpHeadersLogic.transform('First: 1\nSecond: 2\nThird: 3');
    expect(Object.keys(JSON.parse(out))).toEqual(['First', 'Second', 'Third']);
  });

  // --- unicode / emoji / special chars ---
  it('handles unicode and emoji in values', () => {
    const out = httpHeadersLogic.transform('X-Greeting: merhaba 👋 dünya');
    expect(JSON.parse(out)).toEqual({ 'X-Greeting': 'merhaba 👋 dünya' });
  });

  it('preserves special characters and equals signs in cookie values', () => {
    const out = httpHeadersLogic.transform('Cookie: id=abc123; theme=dark; flag=1');
    expect(JSON.parse(out)).toEqual({ Cookie: 'id=abc123; theme=dark; flag=1' });
  });

  // --- error paths ---
  it('throws on empty string', () => {
    expect(() => httpHeadersLogic.transform('')).toThrow('No headers found.');
  });

  it('throws on whitespace-only input', () => {
    expect(() => httpHeadersLogic.transform('   \n\t  \n  ')).toThrow('No headers found.');
  });

  it('throws when every line lacks a usable colon', () => {
    expect(() => httpHeadersLogic.transform('GET / HTTP/1.1\nHTTP/1.1 200 OK')).toThrow(
      'No headers found.',
    );
  });

  it('throws when only a leading-colon line is present', () => {
    expect(() => httpHeadersLogic.transform(':just-a-value')).toThrow('No headers found.');
  });

  // --- large input ---
  it('handles a large number of headers', () => {
    const lines = Array.from({ length: 500 }, (_, i) => `X-Header-${i}: value${i}`);
    const out = httpHeadersLogic.transform(lines.join('\n'));
    const parsed = JSON.parse(out);
    expect(Object.keys(parsed)).toHaveLength(500);
    expect(parsed['X-Header-0']).toBe('value0');
    expect(parsed['X-Header-499']).toBe('value499');
  });

  // --- realistic response block + request line skipping ---
  it('parses a realistic response header block, ignoring the status line', () => {
    const raw = [
      'HTTP/1.1 200 OK',
      'Content-Type: application/json; charset=utf-8',
      'Content-Length: 1234',
      'Cache-Control: no-cache',
      'Date: Mon, 08 Jun 2026 12:00:00 GMT',
    ].join('\n');
    const out = httpHeadersLogic.transform(raw);
    expect(JSON.parse(out)).toEqual({
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': '1234',
      'Cache-Control': 'no-cache',
      Date: 'Mon, 08 Jun 2026 12:00:00 GMT',
    });
  });

  // --- determinism ---
  it('is deterministic for the same input', () => {
    const input = 'A: 1\nB: 2\nC: 3';
    expect(httpHeadersLogic.transform(input)).toBe(httpHeadersLogic.transform(input));
  });
});
