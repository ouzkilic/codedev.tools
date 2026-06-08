import { describe, it, expect } from 'vitest';
import { httpHeadersLogic } from './logic';

describe('httpHeaders', () => {
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
});
