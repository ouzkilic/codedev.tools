import { describe, it, expect } from 'vitest';
import { hashBuffer } from './logic';

describe('fileHash', () => {
  it('hashes buffer content with SHA-256 (matches text hash of "abc")', async () => {
    const buf = new TextEncoder().encode('abc');
    expect(await hashBuffer(buf, 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
  it('supports SHA-1', async () => {
    const buf = new TextEncoder().encode('abc');
    expect(await hashBuffer(buf, 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });
  it('falls back to SHA-256 for unknown algorithm', async () => {
    const buf = new TextEncoder().encode('abc');
    expect(await hashBuffer(buf, 'nope')).toHaveLength(64);
  });
});
