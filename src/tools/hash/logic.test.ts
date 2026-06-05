import { describe, it, expect } from 'vitest';
import { hashText } from './logic';

describe('hash', () => {
  it('computes SHA-256 (known vector)', async () => {
    expect(await hashText('abc', 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
  it('computes SHA-1 (known vector)', async () => {
    expect(await hashText('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });
  it('computes SHA-512 with the expected length (128 hex chars)', async () => {
    expect(await hashText('abc', 'SHA-512')).toHaveLength(128);
  });
  it('falls back to SHA-256 for an unknown algorithm', async () => {
    expect(await hashText('abc', 'nope')).toBe(await hashText('abc', 'SHA-256'));
  });
});
