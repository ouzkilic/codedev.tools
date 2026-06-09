import { describe, it, expect } from 'vitest';
import { formatQrResult } from './logic';

const FALLBACK = 'No QR code found in the image.';

describe('formatQrResult', () => {
  // --- Happy paths (truthy text is returned verbatim) ---
  it('returns the decoded text when non-empty', () => {
    expect(formatQrResult('https://x.com')).toBe('https://x.com');
  });

  it('returns a plain non-url string verbatim', () => {
    expect(formatQrResult('hello world')).toBe('hello world');
  });

  it('returns a single character verbatim', () => {
    expect(formatQrResult('a')).toBe('a');
  });

  it('returns the string "0" verbatim (truthy string, not falsy number)', () => {
    expect(formatQrResult('0')).toBe('0');
  });

  it('returns the string "false" verbatim', () => {
    expect(formatQrResult('false')).toBe('false');
  });

  // --- Falsy branch: null and empty string -> fallback ---
  it('returns a fallback message when text is null', () => {
    expect(formatQrResult(null)).toBe(FALLBACK);
  });

  it('returns a fallback message when text is empty', () => {
    expect(formatQrResult('')).toBe(FALLBACK);
  });

  // --- Whitespace is truthy in JS, so it is returned as-is (not trimmed) ---
  it('returns a single space verbatim (whitespace is truthy)', () => {
    expect(formatQrResult(' ')).toBe(' ');
  });

  it('returns a whitespace-only string verbatim without trimming', () => {
    expect(formatQrResult('   \t\n  ')).toBe('   \t\n  ');
  });

  it('preserves leading and trailing whitespace around content', () => {
    expect(formatQrResult('  payload  ')).toBe('  payload  ');
  });

  // --- Unicode / emoji / special chars ---
  it('preserves unicode characters', () => {
    expect(formatQrResult('Selam dünya — çğıöşü')).toBe('Selam dünya — çğıöşü');
  });

  it('preserves emoji', () => {
    expect(formatQrResult('QR 🎉🔳✅')).toBe('QR 🎉🔳✅');
  });

  it('preserves special / control-ish characters', () => {
    const s = 'line1\nline2\ttabbed\r\nwin';
    expect(formatQrResult(s)).toBe(s);
  });

  it('preserves a complex URL with query and fragment', () => {
    const url = 'https://example.com/path?q=1&x=y#frag';
    expect(formatQrResult(url)).toBe(url);
  });

  it('preserves a wifi QR payload string', () => {
    const wifi = 'WIFI:T:WPA;S:MyNet;P:p@ss w0rd;;';
    expect(formatQrResult(wifi)).toBe(wifi);
  });

  // --- Large input ---
  it('handles a very large input without truncation', () => {
    const big = 'x'.repeat(100000);
    const out = formatQrResult(big);
    expect(out).toBe(big);
    expect(out.length).toBe(100000);
  });

  // --- Determinism / idempotency ---
  it('is deterministic for the same input', () => {
    expect(formatQrResult('repeat-me')).toBe(formatQrResult('repeat-me'));
  });

  it('is idempotent: feeding output back yields the same value', () => {
    const first = formatQrResult('payload');
    expect(formatQrResult(first)).toBe(first);
  });

  it('returns the fallback message itself verbatim when given as input (truthy)', () => {
    // The fallback text is a non-empty string, so it is returned as-is, not doubled.
    expect(formatQrResult(FALLBACK)).toBe(FALLBACK);
  });

  // --- Return type is always a string ---
  it('always returns a string for the falsy branch', () => {
    expect(typeof formatQrResult(null)).toBe('string');
    expect(typeof formatQrResult('')).toBe('string');
  });

  it('always returns a string for the truthy branch', () => {
    expect(typeof formatQrResult('anything')).toBe('string');
  });
});
