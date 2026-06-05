import { describe, it, expect } from 'vitest';
import { hmac } from './logic';

describe('hmac', () => {
  it('computes HMAC-SHA256 (known vector)', async () => {
    const out = await hmac('The quick brown fox jumps over the lazy dog', 'key', 'SHA-256');
    expect(out).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
  });
  it('produces different output for a different key', async () => {
    const a = await hmac('message', 'key1', 'SHA-256');
    const b = await hmac('message', 'key2', 'SHA-256');
    expect(a).not.toBe(b);
  });
  it('supports SHA-512 (128 hex chars)', async () => {
    expect(await hmac('msg', 'key', 'SHA-512')).toHaveLength(128);
  });
});
