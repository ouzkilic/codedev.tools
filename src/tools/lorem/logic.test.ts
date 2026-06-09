import { describe, it, expect } from 'vitest';
import { generateLorem, LOREM_OPTIONS } from './logic';

describe('lorem', () => {
  // --- happy paths: each unit ---
  it('generates the requested number of words', () => {
    expect(generateLorem({ unit: 'words', count: '10' }).split(' ')).toHaveLength(10);
  });

  it('generates the requested number of sentences', () => {
    const out = generateLorem({ unit: 'sentences', count: '5' });
    expect(out.match(/\./g)).toHaveLength(5);
  });

  it('generates the requested number of paragraphs', () => {
    expect(generateLorem({ unit: 'paragraphs', count: '4' }).split('\n\n')).toHaveLength(4);
  });

  it('capitalizes the first letter (words)', () => {
    expect(generateLorem({ unit: 'words', count: '3' })[0]).toMatch(/[A-Z]/);
  });

  // --- words unit details ---
  it('words output contains no period and no double-newline separators', () => {
    const out = generateLorem({ unit: 'words', count: '20' });
    expect(out).not.toContain('.');
    expect(out).not.toContain('\n\n');
  });

  it('single word is capitalized and is one token', () => {
    const out = generateLorem({ unit: 'words', count: '1' });
    expect(out.split(' ')).toHaveLength(1);
    expect(out[0]).toMatch(/[A-Z]/);
  });

  it('every generated word comes from the known lorem vocabulary', () => {
    const out = generateLorem({ unit: 'words', count: '50' });
    // First word may be capitalized; lowercase everything for the membership check.
    const tokens = out.toLowerCase().split(' ');
    const vocab = new Set(
      (
        'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ' +
        'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud ' +
        'exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure ' +
        'in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint ' +
        'occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'
      ).split(' '),
    );
    for (const t of tokens) {
      expect(vocab.has(t)).toBe(true);
    }
  });

  // --- sentences unit details ---
  it('every sentence ends with a period and starts capitalized', () => {
    const out = generateLorem({ unit: 'sentences', count: '8' });
    // Split on ". " but keep the structure; each piece (before period) starts uppercase.
    const sentences = out.split('. ');
    for (const s of sentences) {
      expect(s[0]).toMatch(/[A-Z]/);
    }
    // Whole output must terminate with a period.
    expect(out.endsWith('.')).toBe(true);
  });

  it('a single sentence has between 6 and 13 words', () => {
    const out = generateLorem({ unit: 'sentences', count: '1' });
    expect(out.endsWith('.')).toBe(true);
    const words = out.slice(0, -1).split(' ');
    expect(words.length).toBeGreaterThanOrEqual(6);
    expect(words.length).toBeLessThanOrEqual(13);
  });

  it('sentences are not separated by double newlines', () => {
    const out = generateLorem({ unit: 'sentences', count: '5' });
    expect(out).not.toContain('\n\n');
  });

  // --- paragraphs unit details ---
  it('defaults to paragraphs when unit is omitted', () => {
    const out = generateLorem({ count: '2' });
    expect(out.split('\n\n')).toHaveLength(2);
  });

  it('each paragraph contains between 3 and 6 sentences', () => {
    const out = generateLorem({ unit: 'paragraphs', count: '3' });
    const paragraphs = out.split('\n\n');
    expect(paragraphs).toHaveLength(3);
    for (const p of paragraphs) {
      const periods = p.match(/\./g);
      expect(periods).not.toBeNull();
      expect(periods!.length).toBeGreaterThanOrEqual(3);
      expect(periods!.length).toBeLessThanOrEqual(6);
    }
  });

  it('an unknown unit value falls back to paragraph rendering', () => {
    // unit !== 'words' and !== 'sentences' hits the paragraph branch.
    const out = generateLorem({ unit: 'gibberish', count: '2' });
    expect(out.split('\n\n')).toHaveLength(2);
  });

  // --- count parsing / clamp behaviour ---
  it('uses fallback count of 3 when count is missing (words)', () => {
    expect(generateLorem({ unit: 'words' }).split(' ')).toHaveLength(3);
  });

  it('uses fallback count of 3 when count is non-numeric', () => {
    expect(generateLorem({ unit: 'words', count: 'abc' }).split(' ')).toHaveLength(3);
  });

  it('uses fallback count of 3 when count is empty string', () => {
    expect(generateLorem({ unit: 'words', count: '' }).split(' ')).toHaveLength(3);
  });

  it('clamps zero up to the minimum of 1', () => {
    expect(generateLorem({ unit: 'words', count: '0' }).split(' ')).toHaveLength(1);
  });

  it('clamps negative counts up to the minimum of 1', () => {
    expect(generateLorem({ unit: 'words', count: '-5' }).split(' ')).toHaveLength(1);
  });

  it('clamps counts above the maximum down to 1000', () => {
    expect(generateLorem({ unit: 'words', count: '5000' }).split(' ')).toHaveLength(1000);
  });

  it('accepts the exact maximum of 1000', () => {
    expect(generateLorem({ unit: 'words', count: '1000' }).split(' ')).toHaveLength(1000);
  });

  it('parseInt-style parsing keeps the leading integer of a mixed string', () => {
    // parseInt('7abc', 10) === 7
    expect(generateLorem({ unit: 'words', count: '7abc' }).split(' ')).toHaveLength(7);
  });

  it('accepts a numeric (non-string) count via String coercion', () => {
    expect(generateLorem({ unit: 'words', count: 12 as unknown as string }).split(' ')).toHaveLength(12);
  });

  // --- determinism of structure (not content) & large input ---
  it('handles a large word count without throwing', () => {
    expect(() => generateLorem({ unit: 'words', count: '1000' })).not.toThrow();
  });

  it('handles a large paragraph count and produces the right number of paragraphs', () => {
    const out = generateLorem({ unit: 'paragraphs', count: '100' });
    expect(out.split('\n\n')).toHaveLength(100);
  });

  // --- LOREM_OPTIONS metadata ---
  it('exposes a unit select with three choices and a count text option', () => {
    const unit = LOREM_OPTIONS.find((o) => o.key === 'unit');
    const count = LOREM_OPTIONS.find((o) => o.key === 'count');
    expect(unit?.type).toBe('select');
    expect(unit?.default).toBe('paragraphs');
    expect(unit?.choices?.map((c) => c.value)).toEqual(['words', 'sentences', 'paragraphs']);
    expect(count?.type).toBe('text');
    expect(count?.default).toBe('3');
  });
});
