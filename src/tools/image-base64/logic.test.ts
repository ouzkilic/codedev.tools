import { describe, it, expect } from 'vitest';
import { bufferToBase64, bufferToDataUri } from './logic';

describe('imageBase64', () => {
  it('encodes a buffer to base64', () => {
    expect(bufferToBase64(new TextEncoder().encode('hi'))).toBe('aGk=');
  });
  it('builds a data URI with the given mime type', () => {
    expect(bufferToDataUri(new TextEncoder().encode('hi'), 'text/plain')).toBe('data:text/plain;base64,aGk=');
  });
  it('falls back to octet-stream when mime is empty', () => {
    expect(bufferToDataUri(new TextEncoder().encode('x'), '')).toContain('data:application/octet-stream;base64,');
  });
});
