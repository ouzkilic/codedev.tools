import { describe, it, expect } from 'vitest';
import { hashBuffer } from './logic';

const enc = (s: string) => new TextEncoder().encode(s);

describe('fileHash / hashBuffer', () => {
  // --- Known-answer vectors (NIST / RFC test vectors for "abc") ---
  it('hashes "abc" with SHA-256', async () => {
    expect(await hashBuffer(enc('abc'), 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('hashes "abc" with SHA-1', async () => {
    expect(await hashBuffer(enc('abc'), 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  it('hashes "abc" with SHA-384', async () => {
    expect(await hashBuffer(enc('abc'), 'SHA-384')).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    );
  });

  it('hashes "abc" with SHA-512', async () => {
    expect(await hashBuffer(enc('abc'), 'SHA-512')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    );
  });

  // --- Empty input: well-known empty-string digests ---
  it('hashes empty buffer with SHA-1', async () => {
    expect(await hashBuffer(enc(''), 'SHA-1')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });

  it('hashes empty buffer with SHA-256', async () => {
    expect(await hashBuffer(enc(''), 'SHA-256')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('hashes empty buffer with SHA-512', async () => {
    expect(await hashBuffer(enc(''), 'SHA-512')).toBe(
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
    );
  });

  // --- Output length per algorithm (hex chars = bytes * 2) ---
  it('produces correct hex lengths per algorithm', async () => {
    const buf = enc('length-check');
    expect(await hashBuffer(buf, 'SHA-1')).toHaveLength(40);
    expect(await hashBuffer(buf, 'SHA-256')).toHaveLength(64);
    expect(await hashBuffer(buf, 'SHA-384')).toHaveLength(96);
    expect(await hashBuffer(buf, 'SHA-512')).toHaveLength(128);
  });

  // --- Output is always lowercase hex ---
  it('produces only lowercase hex characters', async () => {
    const out = await hashBuffer(enc('Hello World!@#$%'), 'SHA-256');
    expect(out).toMatch(/^[0-9a-f]+$/);
  });

  // --- Unknown algorithm falls back to SHA-256 ---
  it('falls back to SHA-256 for an unknown algorithm string', async () => {
    const buf = enc('abc');
    const fallback = await hashBuffer(buf, 'nope');
    expect(fallback).toHaveLength(64);
    expect(fallback).toBe(await hashBuffer(buf, 'SHA-256'));
  });

  it('falls back to SHA-256 for an empty algorithm string', async () => {
    const buf = enc('abc');
    expect(await hashBuffer(buf, '')).toBe(await hashBuffer(buf, 'SHA-256'));
  });

  it('falls back to SHA-256 for a wrong-cased algorithm name (case-sensitive whitelist)', async () => {
    const buf = enc('abc');
    // 'sha-256' is not in the ALGOS whitelist (which is upper-case) -> fallback to SHA-256
    expect(await hashBuffer(buf, 'sha-256')).toBe(await hashBuffer(buf, 'SHA-256'));
  });

  // --- Determinism: same input + algo -> same digest ---
  it('is deterministic for identical input', async () => {
    const a = await hashBuffer(enc('determinism'), 'SHA-256');
    const b = await hashBuffer(enc('determinism'), 'SHA-256');
    expect(a).toBe(b);
  });

  // --- Avalanche: tiny input change -> different digest ---
  it('produces different digests for one-character difference', async () => {
    const a = await hashBuffer(enc('abc'), 'SHA-256');
    const b = await hashBuffer(enc('abd'), 'SHA-256');
    expect(a).not.toBe(b);
  });

  // --- Different algorithms on same input differ ---
  it('produces different digests across algorithms for the same input', async () => {
    const buf = enc('abc');
    const set = new Set([
      await hashBuffer(buf, 'SHA-1'),
      await hashBuffer(buf, 'SHA-256'),
      await hashBuffer(buf, 'SHA-384'),
      await hashBuffer(buf, 'SHA-512'),
    ]);
    expect(set.size).toBe(4);
  });

  // --- Whitespace-only input is distinct from empty ---
  it('hashes whitespace-only input (distinct from empty)', async () => {
    const ws = await hashBuffer(enc('   '), 'SHA-256');
    expect(ws).toBe('0aad7da77d2ed59c396c99a74e49f3a4524dcdbcb5163251b1433d640247aeb4');
    expect(ws).not.toBe(await hashBuffer(enc(''), 'SHA-256'));
  });

  // --- Unicode / emoji handled via UTF-8 bytes ---
  it('hashes unicode + emoji content (UTF-8 bytes)', async () => {
    expect(await hashBuffer(enc('héllo 🌍'), 'SHA-256')).toBe(
      'cbbcee01a3fc5f1c0db23e02be25316adf28ede876031fdbabe5f4fabe47ed7f',
    );
  });

  // --- Accepts an ArrayBuffer (BufferSource), not just a typed array ---
  it('accepts a raw ArrayBuffer as input', async () => {
    const u8 = enc('abc');
    const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
    expect(await hashBuffer(ab, 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  // --- Large input handled and matches reference ---
  it('hashes a large 100k-byte buffer', async () => {
    const big = enc('a'.repeat(100000));
    expect(await hashBuffer(big, 'SHA-256')).toBe(
      '6d1cf22d7cc09b085dfc25ee1a1f3ae0265804c607bc2074ad253bcc82fd81ee',
    );
  });

  // --- Binary bytes (non-text) hashed correctly ---
  it('hashes arbitrary binary bytes', async () => {
    const bytes = new Uint8Array([0x00, 0x01, 0xff, 0x80, 0x7f]);
    const out = await hashBuffer(bytes, 'SHA-256');
    expect(out).toHaveLength(64);
    expect(out).toMatch(/^[0-9a-f]{64}$/);
  });

  // --- Each output byte is zero-padded to two hex digits ---
  it('zero-pads each byte to two hex digits (even length, valid hex)', async () => {
    // The empty SHA-1 digest contains a leading 0x0d -> "0d", verifying padStart(2,'0')
    const out = await hashBuffer(enc(''), 'SHA-1');
    expect(out.length % 2).toBe(0);
    expect(out).toMatch(/^[0-9a-f]+$/);
  });
});
