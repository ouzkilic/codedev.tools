import { describe, it, expect } from 'vitest';
import { generateLorem } from './logic';

describe('lorem', () => {
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
  it('capitalizes the first letter', () => {
    expect(generateLorem({ unit: 'words', count: '3' })[0]).toMatch(/[A-Z]/);
  });
});
