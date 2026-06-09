import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { hashText, hashLogic } from './logic';

const ctx = (algorithm?: string): ToolContext => ({
  options: algorithm === undefined ? {} : { algorithm },
  secondary: '',
});

describe('hashText — known vectors', () => {
  it('computes SHA-256 of "abc"', async () => {
    expect(await hashText('abc', 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('computes SHA-1 of "abc"', async () => {
    expect(await hashText('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  it('computes SHA-384 of "abc"', async () => {
    expect(await hashText('abc', 'SHA-384')).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    );
  });

  it('computes SHA-512 of "abc"', async () => {
    expect(await hashText('abc', 'SHA-512')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    );
  });

  it('computes SHA-256 of "a"', async () => {
    expect(await hashText('a', 'SHA-256')).toBe(
      'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    );
  });
});

describe('hashText — empty string', () => {
  it('SHA-256 of empty string', async () => {
    expect(await hashText('', 'SHA-256')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('SHA-1 of empty string', async () => {
    expect(await hashText('', 'SHA-1')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });

  it('SHA-384 of empty string', async () => {
    expect(await hashText('', 'SHA-384')).toBe(
      '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
    );
  });

  it('SHA-512 of empty string', async () => {
    expect(await hashText('', 'SHA-512')).toBe(
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
    );
  });
});

describe('hashText — output shape per algorithm', () => {
  it('SHA-1 produces 40 hex chars', async () => {
    expect(await hashText('payload', 'SHA-1')).toMatch(/^[0-9a-f]{40}$/);
  });

  it('SHA-256 produces 64 hex chars', async () => {
    expect(await hashText('payload', 'SHA-256')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('SHA-384 produces 96 hex chars', async () => {
    expect(await hashText('payload', 'SHA-384')).toMatch(/^[0-9a-f]{96}$/);
  });

  it('SHA-512 produces 128 hex chars', async () => {
    expect(await hashText('payload', 'SHA-512')).toMatch(/^[0-9a-f]{128}$/);
  });
});

describe('hashText — algorithm fallback', () => {
  it('falls back to SHA-256 for an unknown algorithm', async () => {
    expect(await hashText('abc', 'nope')).toBe(await hashText('abc', 'SHA-256'));
  });

  it('falls back to SHA-256 for empty algorithm string', async () => {
    expect(await hashText('abc', '')).toBe(await hashText('abc', 'SHA-256'));
  });

  it('is case-sensitive: "sha-256" is not the canonical algo and falls back to SHA-256', async () => {
    // 'sha-256' is not in ALGOS (which uses upper-case), so it falls back to SHA-256.
    expect(await hashText('abc', 'sha-256')).toBe(await hashText('abc', 'SHA-256'));
  });

  it('does NOT fall back for a valid non-default algorithm (SHA-512 differs from SHA-256)', async () => {
    expect(await hashText('abc', 'SHA-512')).not.toBe(await hashText('abc', 'SHA-256'));
  });
});

describe('hashText — determinism & sensitivity', () => {
  it('is deterministic across repeated calls', async () => {
    const a = await hashText('repeat me', 'SHA-256');
    const b = await hashText('repeat me', 'SHA-256');
    expect(a).toBe(b);
  });

  it('produces different digests for different inputs (avalanche)', async () => {
    const a = await hashText('hello', 'SHA-256');
    const b = await hashText('hellp', 'SHA-256');
    expect(a).not.toBe(b);
  });

  it('different algorithms yield different digests for same input', async () => {
    const s1 = await hashText('x', 'SHA-1');
    const s256 = await hashText('x', 'SHA-256');
    const s384 = await hashText('x', 'SHA-384');
    const s512 = await hashText('x', 'SHA-512');
    const set = new Set([s1, s256, s384, s512]);
    expect(set.size).toBe(4);
  });
});

describe('hashText — input edge cases', () => {
  it('handles whitespace-only input distinctly from empty', async () => {
    const spaces = await hashText('   ', 'SHA-256');
    expect(spaces).toBe('0aad7da77d2ed59c396c99a74e49f3a4524dcdbcb5163251b1433d640247aeb4');
    expect(spaces).not.toBe(await hashText('', 'SHA-256'));
  });

  it('handles unicode / emoji via UTF-8 encoding', async () => {
    expect(await hashText('héllo 🚀', 'SHA-256')).toBe(
      'd87b4a76e84eea9f187f77311aaa08530b086d1c5aebf4024357286b35cebdcb',
    );
  });

  it('treats leading/trailing whitespace as significant', async () => {
    const trimmed = await hashText('abc', 'SHA-256');
    const padded = await hashText(' abc ', 'SHA-256');
    expect(padded).not.toBe(trimmed);
  });

  it('handles a very large input without crashing and returns valid digest', async () => {
    const big = 'A'.repeat(1_000_000);
    const out = await hashText(big, 'SHA-256');
    expect(out).toMatch(/^[0-9a-f]{64}$/);
  });

  it('handles special characters and control chars', async () => {
    const out = await hashText('\n\t\0<>&"\\', 'SHA-256');
    expect(out).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('hashLogic (AsyncToolLogic)', () => {
  it('exposes a single algorithm select option defaulting to SHA-256', () => {
    expect(hashLogic.options).toHaveLength(1);
    const opt = hashLogic.options![0];
    expect(opt.key).toBe('algorithm');
    expect(opt.type).toBe('select');
    expect(opt.default).toBe('SHA-256');
    expect(opt.choices?.map((c) => c.value)).toEqual(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);
  });

  it('transform uses the selected algorithm (SHA-1)', async () => {
    expect(await hashLogic.transform('abc', ctx('SHA-1'))).toBe(
      'a9993e364706816aba3e25717850c26c9cd0d89d',
    );
  });

  it('transform uses the selected algorithm (SHA-512)', async () => {
    expect(await hashLogic.transform('abc', ctx('SHA-512'))).toBe(await hashText('abc', 'SHA-512'));
  });

  it('transform defaults to SHA-256 when no algorithm option is set', async () => {
    expect(await hashLogic.transform('abc', ctx())).toBe(await hashText('abc', 'SHA-256'));
  });

  it('transform falls back to SHA-256 for an unknown algorithm option', async () => {
    expect(await hashLogic.transform('abc', ctx('bogus'))).toBe(await hashText('abc', 'SHA-256'));
  });
});
