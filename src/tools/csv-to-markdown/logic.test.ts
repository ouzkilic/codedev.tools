import { describe, it, expect } from 'vitest';
import { csvToMarkdownLogic } from './logic';

describe('csvToMarkdown', () => {
  it('builds a markdown table with header separator', () => {
    expect(csvToMarkdownLogic.transform('a,b\n1,2')).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |');
  });
  it('handles multiple rows', () => {
    const out = csvToMarkdownLogic.transform('name,age\nAda,36\nBob,40');
    expect(out).toContain('| Ada | 36 |');
    expect(out).toContain('| Bob | 40 |');
  });
  it('escapes pipe characters', () => {
    expect(csvToMarkdownLogic.transform('"a|b"\nx')).toContain('a\\|b');
  });
});
