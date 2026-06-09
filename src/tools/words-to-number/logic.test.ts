import { describe, it, expect } from 'vitest';
import { wordsToNumberLogic } from './logic';

describe('wordsToNumberLogic', () => {
  it('parses zero', () => {
    expect(wordsToNumberLogic.transform('zero')).toBe('0');
  });

  it('parses hyphenated tens', () => {
    expect(wordsToNumberLogic.transform('forty-two')).toBe('42');
  });

  it('parses one hundred', () => {
    expect(wordsToNumberLogic.transform('one hundred')).toBe('100');
  });

  it('parses one thousand', () => {
    expect(wordsToNumberLogic.transform('one thousand')).toBe('1000');
  });

  it('parses compound thousand', () => {
    expect(wordsToNumberLogic.transform('one thousand two hundred thirty-four')).toBe('1234');
  });

  it('parses negative', () => {
    expect(wordsToNumberLogic.transform('negative five')).toBe('-5');
  });

  it('throws on unparseable input', () => {
    expect(() => wordsToNumberLogic.transform('banana')).toThrow();
  });

  // --- Small words ---
  it('parses single small words', () => {
    expect(wordsToNumberLogic.transform('one')).toBe('1');
    expect(wordsToNumberLogic.transform('nine')).toBe('9');
  });

  it('parses teens', () => {
    expect(wordsToNumberLogic.transform('eleven')).toBe('11');
    expect(wordsToNumberLogic.transform('nineteen')).toBe('19');
  });

  // --- Tens ---
  it('parses bare tens', () => {
    expect(wordsToNumberLogic.transform('twenty')).toBe('20');
    expect(wordsToNumberLogic.transform('ninety')).toBe('90');
  });

  it('parses tens plus units (space separated)', () => {
    expect(wordsToNumberLogic.transform('twenty one')).toBe('21');
  });

  // --- Hundred behaviour ---
  it('treats bare "hundred" as one hundred (implicit one)', () => {
    expect(wordsToNumberLogic.transform('hundred')).toBe('100');
  });

  it('parses hundreds with multiplier', () => {
    expect(wordsToNumberLogic.transform('three hundred')).toBe('300');
    expect(wordsToNumberLogic.transform('nine hundred ninety-nine')).toBe('999');
  });

  // --- "and" handling ---
  it('strips the connector word "and"', () => {
    expect(wordsToNumberLogic.transform('one hundred and one')).toBe('101');
    expect(wordsToNumberLogic.transform('one hundred and twenty-three')).toBe('123');
  });

  // --- Scales ---
  it('treats bare scale words as implicit one', () => {
    expect(wordsToNumberLogic.transform('thousand')).toBe('1000');
    expect(wordsToNumberLogic.transform('million')).toBe('1000000');
    expect(wordsToNumberLogic.transform('billion')).toBe('1000000000');
  });

  it('parses large compound numbers across scales', () => {
    expect(
      wordsToNumberLogic.transform('one million two hundred thirty-four thousand five hundred sixty-seven'),
    ).toBe('1234567');
  });

  it('parses billions', () => {
    expect(wordsToNumberLogic.transform('two billion')).toBe('2000000000');
  });

  // --- Negative variants ---
  it('parses "minus" as a negative marker', () => {
    expect(wordsToNumberLogic.transform('minus forty-two')).toBe('-42');
  });

  it('applies negation to the whole compound result', () => {
    expect(wordsToNumberLogic.transform('negative one thousand')).toBe('-1000');
  });

  // --- Case / whitespace normalisation ---
  it('is case insensitive', () => {
    expect(wordsToNumberLogic.transform('ONE Thousand TWO Hundred')).toBe('1200');
  });

  it('collapses extra whitespace', () => {
    expect(wordsToNumberLogic.transform('   one    thousand   ')).toBe('1000');
  });

  // --- Empty / whitespace input returns empty string (no throw) ---
  it('returns empty string for empty input', () => {
    expect(wordsToNumberLogic.transform('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(wordsToNumberLogic.transform('   \t  \n ')).toBe('');
  });

  // --- Error paths ---
  it('throws when only a sign word is given', () => {
    expect(() => wordsToNumberLogic.transform('negative')).toThrow();
    expect(() => wordsToNumberLogic.transform('minus')).toThrow();
  });

  it('throws on unrecognized words including emoji/unicode', () => {
    expect(() => wordsToNumberLogic.transform('🚀')).toThrow();
    expect(() => wordsToNumberLogic.transform('two 🚀 three')).toThrow();
    expect(() => wordsToNumberLogic.transform('café')).toThrow();
  });

  it('throws with a message naming the unrecognized word', () => {
    expect(() => wordsToNumberLogic.transform('one foo')).toThrow(/Unrecognized word: foo/);
  });

  // --- Idempotency-style sanity: round trip via Number ---
  it('produces parseable integer strings', () => {
    const out = wordsToNumberLogic.transform('seventy-six');
    expect(Number(out)).toBe(76);
    expect(out).toMatch(/^-?\d+$/);
  });

  // --- ctx argument is ignored by this single-input tool ---
  it('ignores the optional context argument', () => {
    expect(wordsToNumberLogic.transform('five', { options: {}, secondary: '' })).toBe('5');
  });
});
