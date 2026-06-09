import { describe, it, expect } from 'vitest';
import { urlParserLogic } from './logic';

describe('urlParser', () => {
  it('breaks a URL into components', () => {
    const out = urlParserLogic.transform('https://example.com:8080/path/to?x=1&y=2#section');
    expect(out).toContain('Protocol:  https:');
    expect(out).toContain('Hostname:  example.com');
    expect(out).toContain('Port:      8080');
    expect(out).toContain('Path:      /path/to');
    expect(out).toContain('Hash:      #section');
  });

  it('lists query parameters', () => {
    const out = urlParserLogic.transform('https://x.com/?a=1&b=2');
    expect(out).toContain('a = 1');
    expect(out).toContain('b = 2');
  });

  it('throws on an invalid URL', () => {
    expect(() => urlParserLogic.transform('not a url')).toThrow();
  });

  it('throws with a helpful message mentioning the protocol', () => {
    expect(() => urlParserLogic.transform('example.com')).toThrow(/protocol/);
  });

  it('throws on an empty string', () => {
    expect(() => urlParserLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => urlParserLogic.transform('   \t  ')).toThrow();
  });

  it('trims surrounding whitespace before parsing', () => {
    const out = urlParserLogic.transform('  https://example.com/  ');
    expect(out).toContain('Hostname:  example.com');
    expect(out).toContain('Protocol:  https:');
  });

  it('shows (default) when no explicit port is present', () => {
    const out = urlParserLogic.transform('https://example.com/');
    expect(out).toContain('Port:      (default)');
  });

  it('shows (none) for missing search and hash', () => {
    const out = urlParserLogic.transform('https://example.com/path');
    expect(out).toContain('Search:    (none)');
    expect(out).toContain('Hash:      (none)');
    expect(out).toContain('Path:      /path');
  });

  it('includes the full search string and origin', () => {
    const out = urlParserLogic.transform('https://example.com:443/a?q=hello&q=world#frag');
    expect(out).toContain('Search:    ?q=hello&q=world');
    expect(out).toContain('Hash:      #frag');
    // Origin omits the default port 443 for https.
    expect(out).toContain('Origin:    https://example.com');
  });

  it('outputs Host including a non-default port but Hostname without it', () => {
    const out = urlParserLogic.transform('https://example.com:8080/');
    expect(out).toContain('Host:      example.com:8080');
    expect(out).toContain('Hostname:  example.com');
  });

  it('does not include a Username line when there is no userinfo', () => {
    const out = urlParserLogic.transform('https://example.com/');
    expect(out).not.toContain('Username:');
  });

  it('includes a Username line when userinfo is present', () => {
    const out = urlParserLogic.transform('https://alice@example.com/');
    expect(out).toContain('Username:  alice');
  });

  it('does not add a Query parameters section when there are none', () => {
    const out = urlParserLogic.transform('https://example.com/path');
    expect(out).not.toContain('Query parameters:');
  });

  it('adds a Query parameters section header when params exist', () => {
    const out = urlParserLogic.transform('https://example.com/?foo=bar');
    expect(out).toContain('Query parameters:');
    expect(out).toContain('  foo = bar');
  });

  it('lists repeated keys as separate parameter entries', () => {
    const out = urlParserLogic.transform('https://example.com/?tag=a&tag=b');
    const lines = out.split('\n').filter((l) => l.startsWith('  tag = '));
    expect(lines).toEqual(['  tag = a', '  tag = b']);
  });

  it('decodes percent-encoded query values', () => {
    const out = urlParserLogic.transform('https://example.com/?q=hello%20world');
    expect(out).toContain('  q = hello world');
  });

  it('handles unicode and emoji in the path and query', () => {
    const out = urlParserLogic.transform('https://example.com/yol/şükür?emoji=😀');
    // searchParams decodes the percent-encoded emoji back to the character.
    expect(out).toContain('  emoji = 😀');
    expect(out).toContain('Hostname:  example.com');
  });

  it('supports non-http schemes such as ftp', () => {
    const out = urlParserLogic.transform('ftp://files.example.com/dir/file.txt');
    expect(out).toContain('Protocol:  ftp:');
    expect(out).toContain('Hostname:  files.example.com');
  });

  it('parses an empty parameter value', () => {
    const out = urlParserLogic.transform('https://example.com/?empty=');
    expect(out).toContain('  empty = ');
  });

  it('handles a large query string with many parameters', () => {
    const pairs = Array.from({ length: 100 }, (_, i) => `k${i}=v${i}`).join('&');
    const out = urlParserLogic.transform(`https://example.com/?${pairs}`);
    expect(out).toContain('  k0 = v0');
    expect(out).toContain('  k99 = v99');
    expect(out.split('\n').filter((l) => l.startsWith('  k')).length).toBe(100);
  });

  it('produces deterministic, idempotent output for the same input', () => {
    const url = 'https://example.com:9000/a/b?x=1#h';
    expect(urlParserLogic.transform(url)).toBe(urlParserLogic.transform(url));
  });
});
