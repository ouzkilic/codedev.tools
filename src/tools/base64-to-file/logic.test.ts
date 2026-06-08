import { describe, it, expect } from 'vitest';
import { parseDataUri } from './logic';

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

describe('base64ToFile', () => {
  it('parses a data URI with mime + base64', () => {
    const r = parseDataUri('data:text/plain;base64,aGVsbG8=');
    expect(r.mime).toBe('text/plain');
    expect(text(r.bytes)).toBe('hello');
  });
  it('accepts a bare base64 string', () => {
    expect(text(parseDataUri('aGk=').bytes)).toBe('hi');
  });
  it('decodes UTF-8 content', () => {
    const r = parseDataUri('data:text/plain;base64,' + btoa(String.fromCharCode(...new TextEncoder().encode('café'))));
    expect(text(r.bytes)).toBe('café');
  });
  it('throws on invalid base64', () => {
    expect(() => parseDataUri('data:x;base64,!!!')).toThrow();
  });
});
