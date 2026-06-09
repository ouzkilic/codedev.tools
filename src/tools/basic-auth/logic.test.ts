import { describe, it, expect } from 'vitest';
import { basicAuthLogic } from './logic';

const build = (user: string, pass: string) =>
  basicAuthLogic.transform(user, { options: {}, secondary: pass });

// Reference encoder mirroring the implementation: UTF-8 bytes -> binary string -> btoa.
const expectedToken = (user: string, pass: string) => {
  const bytes = new TextEncoder().encode(user.trim() + ':' + pass);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
};
const expectedHeader = (user: string, pass: string) =>
  'Authorization: Basic ' + expectedToken(user, pass);

describe('basicAuth', () => {
  it('builds the standard example header', () => {
    expect(build('aladdin', 'opensesame')).toBe('Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l');
  });

  it('works with an empty password', () => {
    expect(build('user', '')).toBe('Authorization: Basic ' + btoa('user:'));
  });

  it('always prefixes the header with "Authorization: Basic "', () => {
    expect(build('a', 'b')).toMatch(/^Authorization: Basic /);
  });

  it('encodes empty user and empty password as base64 of ":"', () => {
    // ":" -> btoa(":") === "Og=="
    expect(build('', '')).toBe('Authorization: Basic Og==');
  });

  it('trims leading/trailing whitespace from the username only', () => {
    // user is trimmed, password is not
    expect(build('  user  ', 'pass')).toBe(expectedHeader('user', 'pass'));
    expect(build('  user  ', 'pass')).toBe('Authorization: Basic ' + btoa('user:pass'));
  });

  it('does NOT trim the password (whitespace in password is preserved)', () => {
    expect(build('user', '  pass  ')).toBe('Authorization: Basic ' + btoa('user:  pass  '));
  });

  it('treats a whitespace-only username as empty after trimming', () => {
    expect(build('   ', 'pass')).toBe(expectedHeader('', 'pass'));
    expect(build('   ', 'pass')).toBe('Authorization: Basic ' + btoa(':pass'));
  });

  it('handles a missing secondary (ctx without secondary) as empty password', () => {
    const out = basicAuthLogic.transform('user', { options: {}, secondary: '' });
    expect(out).toBe('Authorization: Basic ' + btoa('user:'));
  });

  it('handles an entirely missing ctx as empty password', () => {
    // ctx?.secondary ?? '' -> '' when ctx is undefined
    expect(basicAuthLogic.transform('user')).toBe('Authorization: Basic ' + btoa('user:'));
  });

  it('handles ctx with secondary undefined via nullish coalescing', () => {
    const out = basicAuthLogic.transform('user', {
      options: {},
      secondary: undefined as unknown as string,
    });
    expect(out).toBe('Authorization: Basic ' + btoa('user:'));
  });

  it('splits user and password with a single colon', () => {
    // A colon inside the password is kept literally; only the first ":" is the separator semantically.
    expect(build('user', 'pa:ss')).toBe('Authorization: Basic ' + btoa('user:pa:ss'));
  });

  it('encodes colons present in the username', () => {
    expect(build('us:er', 'pass')).toBe('Authorization: Basic ' + btoa('us:er:pass'));
  });

  it('encodes unicode characters via UTF-8 (multi-byte)', () => {
    // "café" contains é (2 UTF-8 bytes) so a naive btoa(user+':'+pass) on the JS string would differ.
    expect(build('café', 'señor')).toBe(expectedHeader('café', 'señor'));
    // Should not equal the (incorrect) latin1 btoa of the raw string for multi-byte content.
    expect(() => build('café', 'señor')).not.toThrow();
  });

  it('encodes emoji (surrogate pair / 4-byte UTF-8) without throwing', () => {
    expect(() => build('user😀', 'pass🚀')).not.toThrow();
    expect(build('user😀', 'pass🚀')).toBe(expectedHeader('user😀', 'pass🚀'));
  });

  it('produces valid base64 (only base64 alphabet + padding)', () => {
    const token = build('user😀', 'p@ssw0rd!').replace('Authorization: Basic ', '');
    expect(token).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });

  it('round-trips: decoding the token recovers "user:pass" (UTF-8)', () => {
    const token = build('  alice ', 's3cret').replace('Authorization: Basic ', '');
    // atob -> binary string -> bytes -> UTF-8 decode
    const bin = atob(token);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    expect(decoded).toBe('alice:s3cret');
  });

  it('round-trips unicode credentials correctly', () => {
    const token = build('café', 'naïve🚀').replace('Authorization: Basic ', '');
    const bin = atob(token);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    expect(decoded).toBe('café:naïve🚀');
  });

  it('is deterministic for identical inputs', () => {
    expect(build('user', 'pass')).toBe(build('user', 'pass'));
  });

  it('handles passwords containing special characters', () => {
    expect(build('user', '+/=%&?#@')).toBe('Authorization: Basic ' + btoa('user:+/=%&?#@'));
  });

  it('handles newline characters inside the password', () => {
    expect(build('user', 'line1\nline2')).toBe('Authorization: Basic ' + btoa('user:line1\nline2'));
  });

  it('handles a very large input without throwing', () => {
    const bigUser = 'a'.repeat(10000);
    const bigPass = 'b'.repeat(10000);
    expect(() => build(bigUser, bigPass)).not.toThrow();
    expect(build(bigUser, bigPass)).toBe(expectedHeader(bigUser, bigPass));
  });

  it('options are ignored (no option branches affect output)', () => {
    const withOpts = basicAuthLogic.transform('user', {
      options: { foo: 'bar', toggle: true },
      secondary: 'pass',
    });
    expect(withOpts).toBe('Authorization: Basic ' + btoa('user:pass'));
  });

  it('exposes the expected secondary metadata', () => {
    expect(basicAuthLogic.secondary).toEqual({ label: 'Password', placeholder: 'password' });
  });

  it('does not define configurable options', () => {
    expect(basicAuthLogic.options).toBeUndefined();
  });
});
