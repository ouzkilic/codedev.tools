import { describe, it, expect } from 'vitest';
import { crc32, crc32Logic } from './logic';

describe('crc32', () => {
  it('matches the known CRC32 of "abc"', () => {
    expect(crc32('abc').toString(16)).toBe('352441c2');
  });
  it('matches the known CRC32 of "The quick brown fox jumps over the lazy dog"', () => {
    expect(crc32('The quick brown fox jumps over the lazy dog').toString(16)).toBe('414fa339');
  });
  it('outputs hex and decimal', () => {
    const out = crc32Logic.transform('abc');
    expect(out).toContain('352441c2');
    expect(out).toContain(String(crc32('abc')));
  });
});
