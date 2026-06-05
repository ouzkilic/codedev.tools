import { describe, it, expect } from 'vitest';
import { generateNanoids } from './logic';

describe('nanoid', () => {
  it('generates the requested count and length', () => {
    const ids = generateNanoids({ length: '10', count: '4' }).split('\n');
    expect(ids).toHaveLength(4);
    expect(ids.every((id) => id.length === 10)).toBe(true);
  });
  it('only uses URL-safe characters', () => {
    const ids = generateNanoids({ length: '32', count: '5' }).split('\n');
    expect(ids.every((id) => /^[A-Za-z0-9_-]+$/.test(id))).toBe(true);
  });
  it('produces unique values', () => {
    const ids = generateNanoids({ length: '21', count: '50' }).split('\n');
    expect(new Set(ids).size).toBe(50);
  });
  it('falls back to defaults for invalid input', () => {
    const ids = generateNanoids({ length: 'x', count: 'y' }).split('\n');
    expect(ids).toHaveLength(1);
    expect(ids[0].length).toBe(21);
  });
});
