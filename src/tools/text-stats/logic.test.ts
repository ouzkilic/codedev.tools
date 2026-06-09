import { describe, it, expect } from 'vitest';
import { textStatsLogic } from './logic';

const stats = (s: string) => textStatsLogic.transform(s);

// Parse the formatted output into a structured record for precise assertions.
const parse = (s: string) => {
  const out = stats(s);
  const num = (label: RegExp) => {
    const m = out.match(label);
    if (!m) throw new Error(`label not found: ${label}`);
    return Number(m[1]);
  };
  return {
    raw: out,
    chars: num(/Characters:\s+(\d+)/),
    charsNoSpaces: num(/no space\):\s+(\d+)/),
    words: num(/Words:\s+(\d+)/),
    lines: num(/Lines:\s+(\d+)/),
    bytes: num(/Bytes \(UTF-8\):\s+(\d+)/),
  };
};

describe('textStats', () => {
  it('counts characters, words and lines', () => {
    const out = stats('hello world');
    expect(out).toMatch(/Characters:\s+11/);
    expect(out).toMatch(/Words:\s+2/);
    expect(out).toMatch(/Lines:\s+1/);
  });

  it('counts characters without spaces', () => {
    expect(stats('a b c')).toMatch(/no space\):\s+3/);
  });

  it('counts lines across newlines', () => {
    expect(stats('a\nb\nc')).toMatch(/Lines:\s+3/);
  });

  it('counts UTF-8 bytes (multi-byte chars)', () => {
    expect(stats('café')).toMatch(/Bytes \(UTF-8\):\s+5/);
  });

  it('emits all five metric lines in order', () => {
    const lines = stats('test').split('\n');
    expect(lines).toHaveLength(5);
    expect(lines[0]).toMatch(/^Characters:/);
    expect(lines[1]).toMatch(/^Characters \(no space\):/);
    expect(lines[2]).toMatch(/^Words:/);
    expect(lines[3]).toMatch(/^Lines:/);
    expect(lines[4]).toMatch(/^Bytes \(UTF-8\):/);
  });

  it('handles empty input: zeros except one line', () => {
    const r = parse('');
    expect(r.chars).toBe(0);
    expect(r.charsNoSpaces).toBe(0);
    expect(r.words).toBe(0);
    expect(r.lines).toBe(1); // split('\n') on '' yields ['']
    expect(r.bytes).toBe(0);
  });

  it('whitespace-only input: zero words and no-space chars', () => {
    const r = parse('   \t\n  ');
    expect(r.chars).toBe(7);
    expect(r.charsNoSpaces).toBe(0);
    expect(r.words).toBe(0);
    expect(r.lines).toBe(2); // one embedded newline
    expect(r.bytes).toBe(7);
  });

  it('collapses multiple spaces between words for word count', () => {
    const r = parse('a  b   c');
    expect(r.words).toBe(3);
    expect(r.chars).toBe(8);
    expect(r.charsNoSpaces).toBe(3);
    expect(r.lines).toBe(1);
  });

  it('counts a single emoji as a surrogate pair (2 chars, 4 bytes)', () => {
    const r = parse('😀');
    expect(r.chars).toBe(2); // UTF-16 surrogate pair
    expect(r.charsNoSpaces).toBe(2);
    expect(r.words).toBe(1);
    expect(r.bytes).toBe(4);
    expect(r.lines).toBe(1);
  });

  it('counts emoji embedded in ASCII text', () => {
    const r = parse('a😀b');
    expect(r.chars).toBe(4);
    expect(r.charsNoSpaces).toBe(4);
    expect(r.words).toBe(1);
    expect(r.bytes).toBe(6); // 1 + 4 + 1
  });

  it('treats a trailing newline as an extra (empty) line', () => {
    const r = parse('a\n');
    expect(r.lines).toBe(2);
    expect(r.words).toBe(1);
    expect(r.charsNoSpaces).toBe(1);
    expect(r.bytes).toBe(2);
  });

  it('treats CRLF as whitespace separating words and counts the newline split', () => {
    const r = parse('a\r\nb');
    expect(r.chars).toBe(4);
    expect(r.charsNoSpaces).toBe(2); // \r and \n removed
    expect(r.words).toBe(2); // \r is whitespace, so 'a' and 'b'
    expect(r.lines).toBe(2); // split on \n
    expect(r.bytes).toBe(4);
  });

  it('counts tabs as whitespace, not characters-without-space', () => {
    const r = parse('a\tb');
    expect(r.chars).toBe(3);
    expect(r.charsNoSpaces).toBe(2);
    expect(r.words).toBe(2);
  });

  it('byte count equals char count for pure ASCII', () => {
    const r = parse('Hello, World!');
    expect(r.bytes).toBe(r.chars);
    expect(r.chars).toBe(13);
  });

  it('byte count exceeds char count for non-ASCII', () => {
    const r = parse('café');
    expect(r.bytes).toBeGreaterThan(r.chars);
    expect(r.chars).toBe(4);
    expect(r.bytes).toBe(5);
  });

  it('handles large input proportionally', () => {
    const unit = 'word ';
    const big = unit.repeat(1000); // 1000 words + trailing space
    const r = parse(big);
    expect(r.words).toBe(1000);
    expect(r.chars).toBe(5000);
    expect(r.charsNoSpaces).toBe(4000);
    expect(r.lines).toBe(1);
    expect(r.bytes).toBe(5000);
  });

  it('counts every line of a multi-line block', () => {
    const r = parse('line1\nline2\nline3\nline4');
    expect(r.lines).toBe(4);
    expect(r.words).toBe(4);
  });

  it('is deterministic for identical input', () => {
    expect(stats('repeat me')).toBe(stats('repeat me'));
  });

  it('charsNoSpaces never exceeds chars', () => {
    for (const sample of ['', 'a b', '  x  ', 'multi\nline\ttext', '😀 ok']) {
      const r = parse(sample);
      expect(r.charsNoSpaces).toBeLessThanOrEqual(r.chars);
    }
  });
});
