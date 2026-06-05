import { describe, it, expect } from 'vitest';
import { slugifyLogic } from './logic';

const slug = (s: string) => slugifyLogic.transform(s);

describe('slugify', () => {
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
});
