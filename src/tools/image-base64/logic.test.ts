import { describe, it, expect } from 'vitest';
import { bufferToBase64, bufferToDataUri } from './logic';

const enc = (s: string) => new TextEncoder().encode(s);

describe('bufferToBase64', () => {
  it('encodes a Uint8Array to base64', () => {
    expect(bufferToBase64(enc('hi'))).toBe('aGk=');
  });

  it('encodes a multi-char ascii string with no padding', () => {
    expect(bufferToBase64(enc('foobar'))).toBe('Zm9vYmFy');
  });

  it('encodes a single byte with double padding', () => {
    expect(bufferToBase64(enc('x'))).toBe('eA==');
  });

  it('returns empty string for an empty buffer', () => {
    expect(bufferToBase64(new Uint8Array(0))).toBe('');
  });

  it('accepts a raw ArrayBuffer (not just Uint8Array)', () => {
    const view = enc('hi');
    // Pass the underlying ArrayBuffer slice to hit the `new Uint8Array(buffer)` branch.
    const ab = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
    expect(bufferToBase64(ab)).toBe('aGk=');
  });

  it('produces identical output for ArrayBuffer and matching Uint8Array', () => {
    const view = enc('foobar');
    const ab = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
    expect(bufferToBase64(ab)).toBe(bufferToBase64(view));
  });

  it('handles arbitrary binary bytes including 0x00 and 0xFF', () => {
    expect(bufferToBase64(new Uint8Array([0, 255, 128, 1, 2, 3]))).toBe('AP+AAQID');
  });

  it('encodes the lowest byte (0x00) on its own', () => {
    expect(bufferToBase64(new Uint8Array([0]))).toBe('AA==');
  });

  it('encodes the highest byte (0xFF) on its own', () => {
    expect(bufferToBase64(new Uint8Array([255]))).toBe('/w==');
  });

  it('encodes utf-8 unicode/emoji bytes correctly', () => {
    expect(bufferToBase64(enc('héllo 🎉'))).toBe('aMOpbGxvIPCfjok=');
  });

  it('is deterministic for the same input', () => {
    const buf = enc('determinism');
    expect(bufferToBase64(buf)).toBe(bufferToBase64(buf));
  });

  it('round-trips through atob back to the original bytes', () => {
    const original = new Uint8Array([0, 13, 64, 127, 200, 255, 42]);
    const b64 = bufferToBase64(original);
    const decoded = atob(b64);
    const back = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) back[i] = decoded.charCodeAt(i);
    expect(Array.from(back)).toEqual(Array.from(original));
  });

  it('handles input larger than the 0x8000 chunk boundary', () => {
    const size = 0x8000 * 2 + 5; // spans three chunk iterations
    const big = new Uint8Array(size);
    for (let i = 0; i < size; i++) big[i] = i % 256;
    const b64 = bufferToBase64(big);
    // base64 length is 4 * ceil(n / 3)
    expect(b64.length).toBe(4 * Math.ceil(size / 3));
    // verify chunking does not corrupt: round-trip the whole thing
    const decoded = atob(b64);
    expect(decoded.length).toBe(size);
    expect(decoded.charCodeAt(0)).toBe(0);
    expect(decoded.charCodeAt(size - 1)).toBe((size - 1) % 256);
  });

  it('produces output of length 4 for any 1-3 byte input', () => {
    expect(bufferToBase64(new Uint8Array([1])).length).toBe(4);
    expect(bufferToBase64(new Uint8Array([1, 2])).length).toBe(4);
    expect(bufferToBase64(new Uint8Array([1, 2, 3])).length).toBe(4);
  });

  it('only emits valid base64 alphabet characters', () => {
    const buf = new Uint8Array(300);
    for (let i = 0; i < buf.length; i++) buf[i] = (i * 7) % 256;
    expect(bufferToBase64(buf)).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
  });
});

describe('bufferToDataUri', () => {
  it('builds a data URI with the given mime type', () => {
    expect(bufferToDataUri(enc('hi'), 'text/plain')).toBe('data:text/plain;base64,aGk=');
  });

  it('uses an image mime type verbatim', () => {
    expect(bufferToDataUri(new Uint8Array([255]), 'image/png')).toBe('data:image/png;base64,/w==');
  });

  it('falls back to octet-stream when mime is an empty string', () => {
    expect(bufferToDataUri(enc('x'), '')).toBe('data:application/octet-stream;base64,eA==');
  });

  it('embeds the same base64 payload as bufferToBase64', () => {
    const buf = enc('foobar');
    const uri = bufferToDataUri(buf, 'image/jpeg');
    expect(uri).toBe(`data:image/jpeg;base64,${bufferToBase64(buf)}`);
  });

  it('builds a valid data URI for an empty buffer', () => {
    expect(bufferToDataUri(new Uint8Array(0), 'image/gif')).toBe('data:image/gif;base64,');
  });

  it('accepts an ArrayBuffer for the data argument', () => {
    const view = enc('hi');
    const ab = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
    expect(bufferToDataUri(ab, 'text/plain')).toBe('data:text/plain;base64,aGk=');
  });

  it('always starts with the data: scheme and contains ;base64,', () => {
    const uri = bufferToDataUri(enc('payload'), 'image/webp');
    expect(uri.startsWith('data:')).toBe(true);
    expect(uri).toContain(';base64,');
  });

  it('round-trips: data URI payload decodes back to original bytes', () => {
    const original = enc('héllo 🎉');
    const uri = bufferToDataUri(original, 'image/svg+xml');
    const payload = uri.split(';base64,')[1];
    const decoded = atob(payload);
    const back = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) back[i] = decoded.charCodeAt(i);
    expect(Array.from(back)).toEqual(Array.from(original));
  });
});
