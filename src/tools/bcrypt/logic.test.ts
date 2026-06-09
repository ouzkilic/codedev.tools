import { describe, expect, it } from 'vitest';
import { bcryptLogic } from './logic';
import type { ToolContext } from '@/hooks/useToolState';

// Helpers to keep call sites terse while matching the AsyncToolLogic convention.
const hashCtx = (rounds?: string): ToolContext => ({
  options: rounds === undefined ? { mode: 'hash' } : { mode: 'hash', rounds },
  secondary: '',
});
const verifyCtx = (secondary: string): ToolContext => ({
  options: { mode: 'verify' },
  secondary,
});

const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

describe('bcryptLogic metadata', () => {
  it('exposes a secondary field for the verify hash', () => {
    expect(bcryptLogic.secondary?.label).toBe('Hash to verify against');
    expect(bcryptLogic.secondary?.placeholder).toContain('$2a$10$');
  });

  it('declares a mode select with hash and verify choices', () => {
    const mode = bcryptLogic.options?.find((o) => o.key === 'mode');
    expect(mode?.type).toBe('select');
    expect(mode?.default).toBe('hash');
    const values = mode?.choices?.map((c) => c.value);
    expect(values).toEqual(['hash', 'verify']);
  });

  it('declares a rounds option defaulting to 10', () => {
    const rounds = bcryptLogic.options?.find((o) => o.key === 'rounds');
    expect(rounds?.type).toBe('text');
    expect(rounds?.default).toBe('10');
  });
});

describe('bcryptLogic hash mode', () => {
  it('hashes a password to a valid 60-char bcrypt string', async () => {
    const out = await bcryptLogic.transform('pw', hashCtx('8'));
    expect(out).toMatch(BCRYPT_RE);
    expect(out).toHaveLength(60);
  });

  it('starts every hash with the $2 version marker', async () => {
    const out = await bcryptLogic.transform('hello', hashCtx('4'));
    expect(out.startsWith('$2')).toBe(true);
  });

  it('encodes the requested cost factor zero-padded to two digits', async () => {
    const out = await bcryptLogic.transform('pw', hashCtx('8'));
    expect(out.split('$')[2]).toBe('08');
  });

  it('encodes a two-digit cost factor without extra padding', async () => {
    const out = await bcryptLogic.transform('pw', hashCtx('11'));
    expect(out.split('$')[2]).toBe('11');
  });

  it('defaults to 10 rounds when rounds option is omitted', async () => {
    const out = await bcryptLogic.transform('pw', hashCtx());
    expect(out.split('$')[2]).toBe('10');
  });

  it('falls back to 10 rounds when rounds is non-numeric', async () => {
    const out = await bcryptLogic.transform('pw', hashCtx('abc'));
    expect(out.split('$')[2]).toBe('10');
  });

  it('falls back to 10 rounds when rounds is an empty string', async () => {
    const out = await bcryptLogic.transform('pw', hashCtx(''));
    expect(out.split('$')[2]).toBe('10');
  });

  it('falls back to 10 rounds when rounds parses to zero (falsy)', async () => {
    // parseInt('0',10) || 10 === 10
    const out = await bcryptLogic.transform('pw', hashCtx('0'));
    expect(out.split('$')[2]).toBe('10');
  });

  it('parses a leading-integer rounds string (e.g. "12abc" -> 12)', async () => {
    const out = await bcryptLogic.transform('pw', hashCtx('12abc'));
    expect(out.split('$')[2]).toBe('12');
  });

  it('trims surrounding whitespace in the rounds string via parseInt', async () => {
    const out = await bcryptLogic.transform('pw', hashCtx('  4 '));
    expect(out.split('$')[2]).toBe('04');
  });

  it('produces non-deterministic hashes (unique salt per call)', async () => {
    const a = await bcryptLogic.transform('same', hashCtx('4'));
    const b = await bcryptLogic.transform('same', hashCtx('4'));
    expect(a).not.toBe(b);
    expect(a).toMatch(BCRYPT_RE);
    expect(b).toMatch(BCRYPT_RE);
  });

  it('hashes an empty input string to a valid bcrypt hash', async () => {
    // transform itself does not short-circuit empty input (the hook does).
    const out = await bcryptLogic.transform('', hashCtx('4'));
    expect(out).toMatch(BCRYPT_RE);
  });

  it('hashes whitespace-only input to a valid bcrypt hash', async () => {
    const out = await bcryptLogic.transform('   ', hashCtx('4'));
    expect(out).toMatch(BCRYPT_RE);
  });

  it('hashes unicode / emoji input to a valid bcrypt hash', async () => {
    const out = await bcryptLogic.transform('🚀café—Ω', hashCtx('4'));
    expect(out).toMatch(BCRYPT_RE);
  });

  it('hashes special characters and is verifiable round-trip', async () => {
    const pw = '!@#$%^&*()_+{}|:"<>?`~';
    const out = await bcryptLogic.transform(pw, hashCtx('4'));
    expect(out).toMatch(BCRYPT_RE);
    expect(await bcryptLogic.transform(pw, verifyCtx(out))).toBe('✓ Match');
  });

  it('hashes a very large input without crashing', async () => {
    const big = 'a'.repeat(50_000);
    const out = await bcryptLogic.transform(big, hashCtx('4'));
    expect(out).toMatch(BCRYPT_RE);
  });
});

describe('bcryptLogic verify mode', () => {
  it('reports a match for the correct password', async () => {
    const h = await bcryptLogic.transform('pw', hashCtx('4'));
    expect(await bcryptLogic.transform('pw', verifyCtx(h))).toBe('✓ Match');
  });

  it('reports no match for a wrong password', async () => {
    const h = await bcryptLogic.transform('pw', hashCtx('4'));
    expect(await bcryptLogic.transform('nope', verifyCtx(h))).toBe('✗ No match');
  });

  it('is case-sensitive when comparing passwords', async () => {
    const h = await bcryptLogic.transform('Secret', hashCtx('4'));
    expect(await bcryptLogic.transform('secret', verifyCtx(h))).toBe('✗ No match');
  });

  it('trims surrounding whitespace on the supplied hash before comparing', async () => {
    const h = await bcryptLogic.transform('pw', hashCtx('4'));
    expect(await bcryptLogic.transform('pw', verifyCtx(`  \n${h}\t `))).toBe('✓ Match');
  });

  it('round-trips unicode passwords through hash + verify', async () => {
    const pw = '🚀café';
    const h = await bcryptLogic.transform(pw, hashCtx('4'));
    expect(await bcryptLogic.transform(pw, verifyCtx(h))).toBe('✓ Match');
    expect(await bcryptLogic.transform('cafe', verifyCtx(h))).toBe('✗ No match');
  });

  it('returns no match for an empty hash instead of throwing', async () => {
    expect(await bcryptLogic.transform('pw', verifyCtx(''))).toBe('✗ No match');
  });

  it('returns no match for a malformed / non-bcrypt hash instead of throwing', async () => {
    expect(await bcryptLogic.transform('pw', verifyCtx('not-a-bcrypt-hash'))).toBe('✗ No match');
  });

  it('treats a missing secondary as an empty hash (no match)', async () => {
    const out = await bcryptLogic.transform('pw', { options: { mode: 'verify' }, secondary: '' });
    expect(out).toBe('✗ No match');
  });

  it('verifies an empty-string password against its own hash', async () => {
    const h = await bcryptLogic.transform('', hashCtx('4'));
    expect(await bcryptLogic.transform('', verifyCtx(h))).toBe('✓ Match');
  });
});

describe('bcryptLogic mode resolution', () => {
  it('defaults to hash mode when mode option is missing', async () => {
    const out = await bcryptLogic.transform('pw', { options: {}, secondary: '' });
    expect(out).toMatch(BCRYPT_RE);
  });

  it('treats any non-verify mode value as hashing', async () => {
    const out = await bcryptLogic.transform('pw', { options: { mode: 'unknown' }, secondary: '' });
    expect(out).toMatch(BCRYPT_RE);
  });
});
