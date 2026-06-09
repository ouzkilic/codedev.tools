import { describe, it, expect } from 'vitest';
import { hashIdLogic } from './logic';

const run = (input: string) => hashIdLogic.transform(input, { options: {}, secondary: '' });

describe('hashIdLogic', () => {
  // --- empty / whitespace ---
  it('returns empty string for an empty input', () => {
    expect(run('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(run('   ')).toBe('');
  });

  it('returns empty string for tabs and newlines only', () => {
    expect(run('\t\n  \n')).toBe('');
  });

  // --- trimming behaviour ---
  it('trims leading and trailing whitespace before identifying', () => {
    expect(run('   5d41402abc4b2a76b9719d911017c592   ')).toBe('Possible: MD5 / MD4 / NTLM');
  });

  it('trims around a SHA-256 length hash', () => {
    expect(run('\n' + 'a'.repeat(64) + '\t')).toContain('SHA-256');
  });

  // --- bcrypt prefixes (checked before hex test) ---
  it('identifies bcrypt with $2$ prefix', () => {
    expect(run('$2$10$abcdefghijklmnopqrstuv')).toBe('Possible: bcrypt');
  });

  it('identifies bcrypt with $2a$ prefix', () => {
    expect(run('$2a$10$abcdefghijklmnopqrstuv')).toBe('Possible: bcrypt');
  });

  it('identifies bcrypt with $2b$ prefix', () => {
    expect(run('$2b$10$abcdefghijklmnopqrstuv')).toBe('Possible: bcrypt');
  });

  it('identifies bcrypt with $2y$ prefix', () => {
    expect(run('$2y$10$abcdefghijklmnopqrstuv')).toBe('Possible: bcrypt');
  });

  it('does not treat $2x$ as bcrypt (only a/b/y allowed)', () => {
    // regex /^\$2[aby]?\$/ requires the optional char then a literal $ — $2x$ fails
    expect(run('$2x$10$abcdef')).toBe('Unknown (non-hex / unrecognized).');
  });

  // --- argon2 prefix ---
  it('identifies Argon2 with $argon2id prefix', () => {
    expect(run('$argon2id$v=19$m=65536,t=3,p=4$abc$def')).toBe('Possible: Argon2');
  });

  it('identifies Argon2 with $argon2i prefix', () => {
    expect(run('$argon2i$v=19$xyz')).toBe('Possible: Argon2');
  });

  // --- hex length map ---
  it('identifies CRC32 / Adler-32 by 8 hex chars', () => {
    expect(run('deadbeef')).toBe('Possible: CRC32 / Adler-32');
  });

  it('identifies MD5 / MD4 / NTLM by 32 hex chars', () => {
    expect(run('5d41402abc4b2a76b9719d911017c592')).toBe('Possible: MD5 / MD4 / NTLM');
  });

  it('identifies SHA-1 / RIPEMD-160 by 40 hex chars', () => {
    expect(run('a'.repeat(40))).toBe('Possible: SHA-1 / RIPEMD-160');
  });

  it('identifies SHA-224 by 56 hex chars', () => {
    expect(run('f'.repeat(56))).toBe('Possible: SHA-224');
  });

  it('identifies SHA-256 / SHA3-256 by 64 hex chars', () => {
    expect(run('0'.repeat(64))).toBe('Possible: SHA-256 / SHA3-256');
  });

  it('identifies SHA-384 by 96 hex chars', () => {
    expect(run('1'.repeat(96))).toBe('Possible: SHA-384');
  });

  it('identifies SHA-512 / SHA3-512 by 128 hex chars', () => {
    expect(run('9'.repeat(128))).toBe('Possible: SHA-512 / SHA3-512');
  });

  // --- uppercase / mixed-case hex still valid ---
  it('accepts uppercase hex characters', () => {
    expect(run('5D41402ABC4B2A76B9719D911017C592')).toBe('Possible: MD5 / MD4 / NTLM');
  });

  it('accepts mixed-case hex characters', () => {
    expect(run('AbCdEf01')).toBe('Possible: CRC32 / Adler-32');
  });

  // --- hex but unrecognized length ---
  it('reports unknown length for valid hex of unmapped length', () => {
    expect(run('abc')).toBe('Possible: unknown (3 hex chars)');
  });

  it('reports unknown length for a 16-char hex string', () => {
    expect(run('a'.repeat(16))).toBe('Possible: unknown (16 hex chars)');
  });

  it('reports the exact length for a very large hex string', () => {
    expect(run('f'.repeat(10000))).toBe('Possible: unknown (10000 hex chars)');
  });

  // --- non-hex / unrecognized ---
  it('flags input with spaces inside as non-hex', () => {
    expect(run('not a hash!')).toBe('Unknown (non-hex / unrecognized).');
  });

  it('flags 32-char string containing g (non-hex) as unknown', () => {
    expect(run('g'.repeat(32))).toBe('Unknown (non-hex / unrecognized).');
  });

  it('flags unicode / emoji input as non-hex', () => {
    expect(run('💥🔥 hash 🔥💥')).toBe('Unknown (non-hex / unrecognized).');
  });

  it('flags a base64-looking string with + and / as non-hex', () => {
    expect(run('abc+/def=')).toBe('Unknown (non-hex / unrecognized).');
  });

  it('flags hex with a trailing separator (internal whitespace) as non-hex', () => {
    expect(run('dead beef')).toBe('Unknown (non-hex / unrecognized).');
  });

  // --- determinism ---
  it('is deterministic for repeated identical calls', () => {
    const input = 'a'.repeat(64);
    expect(run(input)).toBe(run(input));
  });

  // --- precedence: bcrypt prefix wins over any hex consideration ---
  it('prioritizes the bcrypt prefix even though the string is non-hex overall', () => {
    expect(run('$2y$abc')).toBe('Possible: bcrypt');
  });
});
