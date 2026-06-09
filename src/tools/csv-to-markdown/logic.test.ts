import { describe, it, expect } from 'vitest';
import { csvToMarkdownLogic } from './logic';

describe('csvToMarkdown', () => {
  // --- happy paths ---
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

  it('produces exactly three lines for header + one data row', () => {
    const out = csvToMarkdownLogic.transform('a,b\n1,2');
    expect(out.split('\n')).toHaveLength(3);
  });

  it('emits one separator dash group per header column', () => {
    const out = csvToMarkdownLogic.transform('a,b,c\n1,2,3');
    const sep = out.split('\n')[1];
    expect(sep).toBe('| --- | --- | --- |');
  });

  it('handles a single-column single-row input (no data rows)', () => {
    // Papa parses "single" -> [["single"]]; slice(1) is empty
    expect(csvToMarkdownLogic.transform('single')).toBe('| single |\n| --- |');
  });

  it('handles a single header-only multi-column row', () => {
    expect(csvToMarkdownLogic.transform('a,b,c')).toBe('| a | b | c |\n| --- | --- | --- |');
  });

  it('handles many data rows deterministically', () => {
    const out = csvToMarkdownLogic.transform('a,b\n1,2\n3,4\n5,6');
    expect(out.split('\n')).toHaveLength(5); // header + sep + 3 rows
    expect(out.endsWith('| 5 | 6 |')).toBe(true);
  });

  // --- input normalization ---
  it('trims surrounding whitespace before parsing', () => {
    expect(csvToMarkdownLogic.transform('\n  a,b\n1,2\n  ')).toBe(
      '| a | b |\n| --- | --- |\n| 1 | 2 |',
    );
  });

  it('handles CRLF line endings', () => {
    expect(csvToMarkdownLogic.transform('a,b\r\n1,2')).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |');
  });

  it('skips empty lines in the middle of input', () => {
    const out = csvToMarkdownLogic.transform('a,b\n\n1,2');
    expect(out).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |');
  });

  // --- delimiter auto-detection ---
  it('auto-detects tab delimiter', () => {
    expect(csvToMarkdownLogic.transform('a\tb\n1\t2')).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |');
  });

  it('auto-detects semicolon delimiter', () => {
    expect(csvToMarkdownLogic.transform('a;b\n1;2')).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |');
  });

  // --- quoting / escaping ---
  it('unwraps doubled quotes into a literal quote', () => {
    // "a""b",c -> a"b , c
    const out = csvToMarkdownLogic.transform('"a""b",c\n1,2');
    expect(out).toContain('| a"b | c |');
  });

  it('preserves quoted comma inside a field', () => {
    const out = csvToMarkdownLogic.transform('"a,b",c\n1,2');
    expect(out).toContain('| a,b | c |');
  });

  it('escapes every pipe in a cell', () => {
    const out = csvToMarkdownLogic.transform('"x|y|z",b\n1,2');
    expect(out).toContain('x\\|y\\|z');
  });

  it('preserves an embedded newline from a quoted field in the cell', () => {
    // "line1\nline2",b -> first cell contains a raw newline
    const out = csvToMarkdownLogic.transform('"line1\nline2",b\nx,y');
    expect(out).toContain('| line1\nline2 | b |');
  });

  // --- empty / ragged cells ---
  it('renders empty cells as blank between pipes', () => {
    // a,,c -> | a |  | c |
    const out = csvToMarkdownLogic.transform('a,,c\n1,2,3');
    expect(out.split('\n')[0]).toBe('| a |  | c |');
  });

  it('does not throw on a row shorter than the header (ragged)', () => {
    // ragged input only yields a filtered Delimiter error, not fatal
    const out = csvToMarkdownLogic.transform('a,b\n1');
    expect(out).toContain('| a | b |');
    expect(out).toContain('| 1 |');
  });

  it('does not throw on a row longer than the header (ragged)', () => {
    const out = csvToMarkdownLogic.transform('a,b\n1,2,3');
    expect(out).toContain('| 1 | 2 | 3 |');
  });

  // --- unicode ---
  it('preserves unicode / emoji content', () => {
    const out = csvToMarkdownLogic.transform('😀,b\n1,2');
    expect(out).toContain('| 😀 | b |');
  });

  // --- large input / determinism ---
  it('handles a large input and is deterministic', () => {
    const rows = Array.from({ length: 500 }, (_, i) => `${i},val${i}`).join('\n');
    const input = `idx,name\n${rows}`;
    const out1 = csvToMarkdownLogic.transform(input);
    const out2 = csvToMarkdownLogic.transform(input);
    expect(out1).toBe(out2);
    expect(out1.split('\n')).toHaveLength(502); // header + sep + 500
    expect(out1).toContain('| 499 | val499 |');
  });

  // --- error paths ---
  it('throws "No rows found." on empty string', () => {
    expect(() => csvToMarkdownLogic.transform('')).toThrow('No rows found.');
  });

  it('throws "No rows found." on whitespace-only input', () => {
    expect(() => csvToMarkdownLogic.transform('   \n  \t ')).toThrow('No rows found.');
  });

  it('throws on an unterminated quoted field', () => {
    expect(() => csvToMarkdownLogic.transform('"unclosed,a\nb,c')).toThrow(
      'Quoted field unterminated',
    );
  });
});
