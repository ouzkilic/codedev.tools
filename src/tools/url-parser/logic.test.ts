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
});
