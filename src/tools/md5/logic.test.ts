import { describe, it, expect } from 'vitest';
import { md5Logic } from './logic';

describe('md5', () => {
  // --- known-answer test vectors (RFC 1321 + well-known strings) ---
  it('hashes a known string', () => {
    expect(md5Logic.transform('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('hashes "hello" consistently', () => {
    expect(md5Logic.transform('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('hashes the empty string to the canonical MD5 of nothing', () => {
    expect(md5Logic.transform('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('hashes a single character "a"', () => {
    expect(md5Logic.transform('a')).toBe('0cc175b9c0f1b6a831c399e269772661');
  });

  it('hashes the RFC 1321 "message digest" vector', () => {
    expect(md5Logic.transform('message digest')).toBe('f96b697d7cb7938d525a2f31aaf161d0');
  });

  it('hashes the full lowercase alphabet vector', () => {
    expect(md5Logic.transform('abcdefghijklmnopqrstuvwxyz')).toBe(
      'c3fcd3d76192e4007dfb496cca67e13b',
    );
  });

  it('hashes the pangram vector', () => {
    expect(md5Logic.transform('The quick brown fox jumps over the lazy dog')).toBe(
      '9e107d9d372bb6826bd81d3542a419d6',
    );
  });

  it('hashes the project name', () => {
    expect(md5Logic.transform('codedev.tools')).toBe('22f244bd522fa5612f50325b5bc8dcbb');
  });

  // --- output shape ---
  it('produces a 32-character lowercase hex digest', () => {
    expect(md5Logic.transform('codedev.tools')).toMatch(/^[0-9a-f]{32}$/);
  });

  it('always returns 32 hex chars regardless of input length', () => {
    for (const input of ['', 'x', 'a much longer input string here']) {
      expect(md5Logic.transform(input)).toMatch(/^[0-9a-f]{32}$/);
    }
  });

  // --- whitespace edge cases ---
  it('hashes a single space distinctly from empty', () => {
    expect(md5Logic.transform(' ')).toBe('7215ee9c7d9dc229d2921a40e899ec5f');
    expect(md5Logic.transform(' ')).not.toBe(md5Logic.transform(''));
  });

  it('hashes whitespace-only input', () => {
    expect(md5Logic.transform('   ')).toBe('628631f07321b22d8c176c200c855e1b');
  });

  it('treats leading whitespace as significant', () => {
    expect(md5Logic.transform(' leading')).toBe('33bf9dda14552fdea9c5a6a8d8630fb0');
    expect(md5Logic.transform(' leading')).not.toBe(md5Logic.transform('leading'));
  });

  it('treats trailing whitespace as significant', () => {
    expect(md5Logic.transform('trailing ')).toBe('a537591d86576a461d17c75418452206');
    expect(md5Logic.transform('abc ')).toBe('28a53e303da9f5742476fd6b62434540');
    expect(md5Logic.transform('abc ')).not.toBe(md5Logic.transform('abc'));
  });

  it('hashes newline and tab control chars distinctly', () => {
    expect(md5Logic.transform('\n')).toBe('68b329da9893e34099c7d8ad5cb9c940');
    expect(md5Logic.transform('\t')).toBe('5e732a1878be2342dbfeff5fe3ca5aa3');
    expect(md5Logic.transform('\n')).not.toBe(md5Logic.transform('\t'));
  });

  // --- numeric boundaries ---
  it('hashes numeric strings', () => {
    expect(md5Logic.transform('0')).toBe('cfcd208495d565ef66e7dff9f98764da');
    expect(md5Logic.transform('123456789')).toBe('25f9e794323b453885f5181f1b624d0b');
  });

  // --- case sensitivity ---
  it('is case-sensitive', () => {
    expect(md5Logic.transform('AbC')).toBe('25aa3ee1c93cad3f274567281066dc18');
    expect(md5Logic.transform('AbC')).not.toBe(md5Logic.transform('abc'));
  });

  // --- unicode / emoji ---
  it('hashes accented (multi-byte) characters', () => {
    expect(md5Logic.transform('café')).toBe('07117fe4a1ebd544965dc19573183da2');
  });

  it('hashes emoji input', () => {
    expect(md5Logic.transform('😀')).toBe('2a02eac39d716a70ecf37579185927b6');
    expect(md5Logic.transform('🚀🌟')).toBe('8bdedf06d4e8fb5b7bbe9314393b49eb');
  });

  it('hashes CJK characters', () => {
    expect(md5Logic.transform('日本語')).toBe('00110af8b4393ef3f72c50be5b332bec');
  });

  // --- large input ---
  it('hashes a large 10k-char input', () => {
    expect(md5Logic.transform('a'.repeat(10000))).toBe('0d0c9c4db6953fee9e03f528cafd7d3e');
  });

  // --- determinism / idempotency ---
  it('is deterministic across repeated calls', () => {
    const a = md5Logic.transform('repeat-me');
    const b = md5Logic.transform('repeat-me');
    expect(a).toBe(b);
  });

  it('produces distinct digests for distinct inputs (collision sanity)', () => {
    const seen = new Set(
      ['abc', 'abd', 'acb', 'bac', 'ABC', 'abc '].map((s) => md5Logic.transform(s)),
    );
    expect(seen.size).toBe(6);
  });

  // --- ctx arg is ignored (single-input tool) ---
  it('ignores the optional ctx argument', () => {
    expect(md5Logic.transform('abc', { options: { foo: 'bar' }, secondary: '' })).toBe(
      '900150983cd24fb0d6963f7d28e17f72',
    );
  });

  // --- surface invariants ---
  it('exposes no options or secondary input (simple single-input tool)', () => {
    expect(md5Logic.options).toBeUndefined();
    expect(md5Logic.secondary).toBeUndefined();
    expect(typeof md5Logic.transform).toBe('function');
  });
});
