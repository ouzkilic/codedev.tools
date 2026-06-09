import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { hmac, hmacLogic } from './logic';

const ctx = (secondary: string, algorithm?: string): ToolContext => ({
  secondary,
  options: algorithm === undefined ? {} : { algorithm },
});

describe('hmac', () => {
  it('computes HMAC-SHA256 (known vector)', async () => {
    const out = await hmac('The quick brown fox jumps over the lazy dog', 'key', 'SHA-256');
    expect(out).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
  });

  it('computes HMAC-SHA1 (known vector)', async () => {
    const out = await hmac('The quick brown fox jumps over the lazy dog', 'key', 'SHA-1');
    expect(out).toBe('de7c9b85b8b78aa6bc8a7a36f70a90701c9db4d9');
  });

  it('computes HMAC-SHA384 (known vector)', async () => {
    const out = await hmac('The quick brown fox jumps over the lazy dog', 'key', 'SHA-384');
    expect(out).toBe(
      'd7f4727e2c0b39ae0f1e40cc96f60242d5b7801841cea6fc592c5d3e1ae50700582a96cf35e1e554995fe4e03381c237',
    );
  });

  it('computes HMAC-SHA512 (known vector)', async () => {
    const out = await hmac('The quick brown fox jumps over the lazy dog', 'key', 'SHA-512');
    expect(out).toBe(
      'b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a',
    );
  });

  it('produces correct length per algorithm (hex digits = digest bytes * 2)', async () => {
    expect(await hmac('msg', 'key', 'SHA-1')).toHaveLength(40);
    expect(await hmac('msg', 'key', 'SHA-256')).toHaveLength(64);
    expect(await hmac('msg', 'key', 'SHA-384')).toHaveLength(96);
    expect(await hmac('msg', 'key', 'SHA-512')).toHaveLength(128);
  });

  it('always outputs lowercase hex characters only', async () => {
    expect(await hmac('a', 'b', 'SHA-512')).toMatch(/^[0-9a-f]+$/);
    expect(await hmac('whatever', 'secret', 'SHA-1')).toMatch(/^[0-9a-f]+$/);
  });

  it('produces different output for a different key', async () => {
    const a = await hmac('message', 'key1', 'SHA-256');
    const b = await hmac('message', 'key2', 'SHA-256');
    expect(a).not.toBe(b);
  });

  it('produces different output for a different message', async () => {
    const a = await hmac('a', 'k', 'SHA-256');
    const b = await hmac('b', 'k', 'SHA-256');
    expect(a).not.toBe(b);
  });

  it('produces a distinct digest per algorithm for the same input', async () => {
    const s1 = await hmac('x', 'y', 'SHA-1');
    const s256 = await hmac('x', 'y', 'SHA-256');
    const s384 = await hmac('x', 'y', 'SHA-384');
    const s512 = await hmac('x', 'y', 'SHA-512');
    expect(new Set([s1, s256, s384, s512]).size).toBe(4);
  });

  it('is deterministic for identical inputs', async () => {
    const a = await hmac('repeat', 'samekey', 'SHA-256');
    const b = await hmac('repeat', 'samekey', 'SHA-256');
    expect(a).toBe(b);
  });

  it('falls back to SHA-256 for an unknown algorithm', async () => {
    const fallback = await hmac('hello', 's', 'BOGUS');
    const sha256 = await hmac('hello', 's', 'SHA-256');
    expect(fallback).toBe(sha256);
    expect(fallback).toHaveLength(64);
  });

  it('falls back to SHA-256 for a lowercase algorithm name (case sensitive)', async () => {
    const fallback = await hmac('hello', 's', 'sha-256');
    const sha256 = await hmac('hello', 's', 'SHA-256');
    expect(fallback).toBe(sha256);
  });

  it('falls back to SHA-256 for an empty algorithm string', async () => {
    const fallback = await hmac('hello', 's', '');
    const sha256 = await hmac('hello', 's', 'SHA-256');
    expect(fallback).toBe(sha256);
  });

  it('handles an empty message (non-empty secret)', async () => {
    const out = await hmac('', 'key', 'SHA-256');
    expect(out).toBe('5d5d139563c95b5967b9bd9a8c9b233a9dedb45072794cd232dc1b74832607d0');
  });

  it('handles a whitespace-only message and keeps it distinct from empty', async () => {
    const out = await hmac('   ', 'key', 'SHA-256');
    expect(out).toHaveLength(64);
    expect(out).toMatch(/^[0-9a-f]+$/);
    expect(out).not.toBe(await hmac('', 'key', 'SHA-256'));
  });

  it('throws for a zero-length (empty) secret key', async () => {
    await expect(hmac('message', '', 'SHA-256')).rejects.toThrow();
  });

  it('handles unicode / emoji in both message and secret', async () => {
    const out = await hmac('\u{1F600}', '\u{1F511}', 'SHA-256');
    expect(out).toHaveLength(64);
    expect(out).toMatch(/^[0-9a-f]+$/);
  });

  it('is byte-sensitive: NFC vs NFD encodings of the same glyph differ', async () => {
    const nfc = await hmac('\u00e9', 'k', 'SHA-256'); // precomposed e-acute
    const nfd = await hmac('e\u0301', 'k', 'SHA-256'); // e + combining acute accent
    expect(nfc).not.toBe(nfd);
  });

  it('handles special / control characters in the message', async () => {
    const out = await hmac('line1\nline2\ttab\0null', 'key', 'SHA-512');
    expect(out).toHaveLength(128);
    expect(out).toMatch(/^[0-9a-f]+$/);
  });

  it('handles very large input deterministically', async () => {
    const big = 'a'.repeat(100_000);
    const a = await hmac(big, 'key', 'SHA-256');
    const b = await hmac(big, 'key', 'SHA-256');
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });
});

describe('hmacLogic', () => {
  it('exposes a secondary "Secret key" input', () => {
    expect(hmacLogic.secondary?.label).toBe('Secret key');
  });

  it('exposes an algorithm select option with all four algorithms', () => {
    const algo = hmacLogic.options?.find((o) => o.key === 'algorithm');
    expect(algo?.type).toBe('select');
    expect(algo?.default).toBe('SHA-256');
    const values = algo?.choices?.map((c) => c.value);
    expect(values).toEqual(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);
  });

  it('transform uses secondary as the secret and the selected algorithm', async () => {
    const out = await hmacLogic.transform(
      'The quick brown fox jumps over the lazy dog',
      ctx('key', 'SHA-256'),
    );
    expect(out).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
  });

  it('transform defaults to SHA-256 when algorithm option is absent', async () => {
    const viaTransform = await hmacLogic.transform('hello', ctx('secret'));
    const direct = await hmac('hello', 'secret', 'SHA-256');
    expect(viaTransform).toBe(direct);
  });

  it('transform honors each algorithm choice', async () => {
    for (const algo of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
      const viaTransform = await hmacLogic.transform('data', ctx('key', algo));
      const direct = await hmac('data', 'key', algo);
      expect(viaTransform).toBe(direct);
    }
  });

  it('transform rejects when secret (secondary) is empty', async () => {
    await expect(hmacLogic.transform('hello', ctx('', 'SHA-256'))).rejects.toThrow();
  });
});
