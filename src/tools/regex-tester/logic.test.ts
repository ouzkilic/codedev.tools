import { describe, it, expect } from 'vitest';
import { regexTesterLogic } from './logic';

const run = (text: string, pattern: string, flags = 'g') =>
  regexTesterLogic.transform(text, { options: { pattern, flags }, secondary: '' });

describe('regexTester', () => {
  it('finds all matches', () => {
    const out = run('a1b22c333', '\\d+');
    expect(out).toContain('Match 1: "1"');
    expect(out).toContain('Match 2: "22"');
    expect(out).toContain('Match 3: "333"');
  });
  it('reports capture groups', () => {
    const out = run('2024-11', '(\\d{4})-(\\d{2})');
    expect(out).toContain('group 1: "2024"');
    expect(out).toContain('group 2: "11"');
  });
  it('reports no matches', () => {
    expect(run('abc', '\\d+')).toBe('No matches.');
  });
  it('throws on an invalid pattern', () => {
    expect(() => run('x', '(')).toThrow(/invalid regex/i);
  });
});
