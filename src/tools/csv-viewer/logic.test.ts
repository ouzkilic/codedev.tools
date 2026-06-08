import { describe, it, expect } from 'vitest';
import { csvViewerLogic } from './logic';

describe('csvViewerLogic', () => {
  it('aligns header and data with separator', () => {
    const out = csvViewerLogic.transform('a,bb\n1,2');
    expect(out).toContain('a | bb');
    expect(out).toContain('1 | 2');
    const lines = out.split('\n');
    expect(lines[1]).toMatch(/^-+-\+--+$/);
  });

  it('pads columns to the widest cell', () => {
    const out = csvViewerLogic.transform('name,id\nalice,1');
    expect(out).toContain('name  | id');
    expect(out).toContain('alice | 1 ');
  });

  it('handles a single column', () => {
    const out = csvViewerLogic.transform('x\n12\n3');
    expect(out).toContain('x ');
    expect(out).toContain('12');
    expect(out.split('\n')[1]).toBe('--');
  });

  it('throws on empty input', () => {
    expect(() => csvViewerLogic.transform('')).toThrow();
  });
});
