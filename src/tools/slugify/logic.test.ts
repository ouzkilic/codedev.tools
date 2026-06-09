import { describe, it, expect } from 'vitest';
import { slugifyLogic } from './logic';

const slug = (s: string) => slugifyLogic.transform(s);

describe('slugify', () => {
  // --- existing assertions (kept) ---
  it('lowercases and hyphenates words', () => {
    expect(slug('Hello, World!')).toBe('hello-world');
  });
  it('strips accents/diacritics', () => {
    expect(slug('Café déjà vu')).toBe('cafe-deja-vu');
  });
  it('transliterates Turkish characters', () => {
    expect(slug('Kırmızı Şeker Çöğü')).toBe('kirmizi-seker-cogu');
  });
  it('collapses repeated separators and trims edges', () => {
    expect(slug('  --multiple   spaces--  ')).toBe('multiple-spaces');
  });

  // --- empty / whitespace-only edge cases ---
  it('returns empty string for empty input', () => {
    expect(slug('')).toBe('');
  });
  it('returns empty string for whitespace-only input', () => {
    expect(slug('   \t\n  ')).toBe('');
  });
  it('returns empty string when input has only separators', () => {
    expect(slug('---')).toBe('');
    expect(slug('___')).toBe('');
    expect(slug('!@#$%^&*()')).toBe('');
  });

  // --- numbers / alphanumerics ---
  it('preserves digits and treats them as valid slug characters', () => {
    expect(slug('123 ABC 456')).toBe('123-abc-456');
  });
  it('keeps leading and trailing digits', () => {
    expect(slug('0 start end 9')).toBe('0-start-end-9');
  });

  // --- casing ---
  it('lowercases everything including all-caps', () => {
    expect(slug('SHOUTING TEXT')).toBe('shouting-text');
  });
  it('does not insert separators between camelCase boundaries', () => {
    expect(slug('CamelCase')).toBe('camelcase');
  });

  // --- separator collapsing & trimming ---
  it('collapses mixed punctuation runs into a single hyphen', () => {
    expect(slug('a.b...c')).toBe('a-b-c');
  });
  it('trims leading and trailing hyphens produced by punctuation', () => {
    expect(slug('!hello world!')).toBe('hello-world');
  });
  it('converts tabs and newlines to single separators', () => {
    expect(slug('tab\tnewline\nhere')).toBe('tab-newline-here');
  });
  it('handles currency and symbols around numbers', () => {
    expect(slug('price: $5.99')).toBe('price-5-99');
  });

  // --- Turkish transliteration (every mapped pair) ---
  it('maps all Turkish-specific letters to ASCII (lower & upper)', () => {
    expect(slug('ı İ ş Ş ğ Ğ ü Ü ö Ö ç Ç')).toBe('i-i-s-s-g-g-u-u-o-o-c-c');
  });
  it('slugs Turkish words correctly', () => {
    expect(slug('İstanbul')).toBe('istanbul');
    expect(slug('Ümit Öğretmen')).toBe('umit-ogretmen');
  });

  // --- unicode / emoji / non-latin scripts ---
  it('drops emoji and keeps surrounding words', () => {
    expect(slug('emoji 😀 test')).toBe('emoji-test');
  });
  it('drops non-latin scripts that are not transliterable', () => {
    expect(slug('北京 city')).toBe('city');
  });
  it('strips combining diacritics regardless of input form', () => {
    // 'é' as base 'e' + combining acute accent (U+0301)
    expect(slug('éclair')).toBe('eclair');
    // naïve (with diaeresis) collapses to naive
    expect(slug('naïve')).toBe('naive');
  });
  it('decomposes compatibility characters via NFKD', () => {
    // ﬁ ligature -> fi, ½ -> 1/2, ² -> 2
    expect(slug('ﬁle ½ ²')).toBe('file-1-2-2');
  });

  // --- determinism / idempotency ---
  it('is idempotent: slugifying a slug returns the same slug', () => {
    const once = slug('Hello, Wörld! 123');
    expect(slug(once)).toBe(once);
  });
  it('is deterministic across repeated calls', () => {
    const input = 'Determinism Çeck — 42!';
    expect(slug(input)).toBe(slug(input));
  });

  // --- structural property: output is always a clean slug ---
  it('produces only lowercase a-z, 0-9 separated by single hyphens', () => {
    const out = slug('Mixed CASE, números & symbols!!! 99 — done');
    expect(out).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
  it('never starts or ends with a hyphen', () => {
    const out = slug('---leading and trailing---');
    expect(out.startsWith('-')).toBe(false);
    expect(out.endsWith('-')).toBe(false);
    expect(out).toBe('leading-and-trailing');
  });

  // --- large input (performance / correctness at scale) ---
  it('handles very large input without producing malformed slugs', () => {
    const big = 'Foo Bar! '.repeat(5000);
    const out = slug(big);
    expect(out).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(out.startsWith('foo-bar-foo-bar')).toBe(true);
    expect(out.endsWith('foo-bar')).toBe(true);
  });
});
