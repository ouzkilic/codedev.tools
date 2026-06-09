import { describe, it, expect } from 'vitest';
import { parseDataUri } from './logic';

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);
const toB64 = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)));

describe('parseDataUri — data URI with base64', () => {
  it('parses a data URI with mime + base64', () => {
    const r = parseDataUri('data:text/plain;base64,aGVsbG8=');
    expect(r.mime).toBe('text/plain');
    expect(text(r.bytes)).toBe('hello');
  });

  it('preserves a non-default mime type from the data URI', () => {
    const r = parseDataUri('data:image/png;base64,aGk=');
    expect(r.mime).toBe('image/png');
    expect(text(r.bytes)).toBe('hi');
  });

  it('decodes UTF-8 (latin accent) content', () => {
    const r = parseDataUri('data:text/plain;base64,' + toB64('café'));
    expect(text(r.bytes)).toBe('café');
  });

  it('decodes unicode emoji content', () => {
    const original = 'hello 👋🌍 dünya';
    const r = parseDataUri('data:text/plain;base64,' + toB64(original));
    expect(text(r.bytes)).toBe(original);
  });

  it('returns the exact byte length of the decoded payload', () => {
    // "ABC" -> 3 bytes
    const r = parseDataUri('data:application/octet-stream;base64,QUJD');
    expect(r.bytes).toBeInstanceOf(Uint8Array);
    expect(r.bytes.length).toBe(3);
    expect(Array.from(r.bytes)).toEqual([65, 66, 67]);
  });

  it('defaults mime to application/octet-stream when mime is empty (data:;base64,)', () => {
    const r = parseDataUri('data:;base64,aGk=');
    expect(r.mime).toBe('application/octet-stream');
    expect(text(r.bytes)).toBe('hi');
  });

  it('strips embedded whitespace/newlines in the base64 payload', () => {
    const r = parseDataUri('data:text/plain;base64,aGVs\n bG8=');
    expect(text(r.bytes)).toBe('hello');
  });

  it('decodes an empty base64 payload to an empty byte array', () => {
    const r = parseDataUri('data:text/plain;base64,');
    expect(r.mime).toBe('text/plain');
    expect(r.bytes.length).toBe(0);
  });
});

describe('parseDataUri — bare base64 (no data: prefix)', () => {
  it('accepts a bare base64 string with default mime', () => {
    const r = parseDataUri('aGk=');
    expect(r.mime).toBe('application/octet-stream');
    expect(text(r.bytes)).toBe('hi');
  });

  it('trims surrounding whitespace before decoding', () => {
    const r = parseDataUri('   aGVsbG8=   ');
    expect(text(r.bytes)).toBe('hello');
  });

  it('strips internal whitespace/newlines from a bare base64 string', () => {
    const r = parseDataUri('aGVs\nbG8=');
    expect(text(r.bytes)).toBe('hello');
  });

  it('decodes an empty/whitespace-only input to an empty byte array', () => {
    expect(parseDataUri('').bytes.length).toBe(0);
    expect(parseDataUri('    ').bytes.length).toBe(0);
  });

  it('round-trips arbitrary text through bare base64', () => {
    const original = 'The quick brown fox — 12345!@#';
    const r = parseDataUri(toB64(original));
    expect(text(r.bytes)).toBe(original);
  });

  it('handles a large input (10k chars) without truncation', () => {
    const original = 'x'.repeat(10000);
    const r = parseDataUri(toB64(original));
    expect(r.bytes.length).toBe(10000);
    expect(text(r.bytes)).toBe(original);
  });
});

describe('parseDataUri — non-base64 data URI (URL-encoded)', () => {
  it('uses decodeURIComponent when ;base64 is absent', () => {
    const r = parseDataUri('data:text/plain,Hello%20World');
    expect(r.mime).toBe('text/plain');
    expect(text(r.bytes)).toBe('Hello World');
  });

  it('decodes URL-encoded unicode without the base64 flag', () => {
    const r = parseDataUri('data:text/plain,caf%C3%A9');
    expect(text(r.bytes)).toBe('café');
  });

  it('handles plain (unencoded) payload when ;base64 is absent', () => {
    const r = parseDataUri('data:text/plain,plain text here');
    expect(text(r.bytes)).toBe('plain text here');
  });

  it('defaults mime for data:,<payload> with no mime and no base64', () => {
    const r = parseDataUri('data:,abc');
    expect(r.mime).toBe('application/octet-stream');
    expect(text(r.bytes)).toBe('abc');
  });
});

describe('parseDataUri — error paths', () => {
  it('throws on invalid base64 characters in a data URI', () => {
    expect(() => parseDataUri('data:x;base64,!!!')).toThrow();
  });

  it('throws on invalid base64 for a bare string', () => {
    expect(() => parseDataUri('@@@not-base64@@@')).toThrow();
  });

  it('throws on a malformed percent-encoding when ;base64 is absent', () => {
    // decodeURIComponent('%') -> URIError
    expect(() => parseDataUri('data:text/plain,%')).toThrow();
  });
});

describe('parseDataUri — determinism & round-trip', () => {
  it('is deterministic: same input yields identical bytes', () => {
    const input = 'data:text/plain;base64,aGVsbG8=';
    const a = parseDataUri(input);
    const b = parseDataUri(input);
    expect(Array.from(a.bytes)).toEqual(Array.from(b.bytes));
    expect(a.mime).toBe(b.mime);
  });

  it('round-trips binary bytes (0..255) through base64', () => {
    const raw = Array.from({ length: 256 }, (_, i) => i);
    const b64 = btoa(String.fromCharCode(...raw));
    const r = parseDataUri('data:application/octet-stream;base64,' + b64);
    expect(Array.from(r.bytes)).toEqual(raw);
  });
});
