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
});
