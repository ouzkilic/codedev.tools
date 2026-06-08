import { describe, it, expect } from 'vitest';
import { tsvViewerLogic } from './logic';

describe('tsvViewerLogic', () => {
  it('aligns a simple TSV into a table', () => {
    const out = tsvViewerLogic.transform('a\tbb\n1\t2');
    expect(out).toContain('a | bb');
    expect(out).toContain('1 | 2');
  });

  it('includes a dashes separator line after the header', () => {
    const out = tsvViewerLogic.transform('a\tbb\n1\t2');
    const lines = out.split('\n');
    expect(lines[1]).toMatch(/^-+/);
    expect(lines[1]).toContain('-');
  });

  it('pads columns to the max width', () => {
    const out = tsvViewerLogic.transform('name\tx\nlonger\ty');
    expect(out).toContain('name   | x');
    expect(out).toContain('longer | y');
  });

  it('handles a single column', () => {
    const out = tsvViewerLogic.transform('foo\nbar');
    expect(out).toContain('foo');
    expect(out).toContain('bar');
  });

  it('throws on empty input', () => {
    expect(() => tsvViewerLogic.transform('   ')).toThrow();
  });
});
