import { describe, it, expect } from 'vitest';
import { textStatsLogic } from './logic';

const stats = (s: string) => textStatsLogic.transform(s);

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
});
