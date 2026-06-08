import { describe, it, expect } from 'vitest';
import { csvTransposeLogic } from './logic';

describe('csvTransposeLogic', () => {
  it('transposes a 2x2 matrix', () => {
    expect(csvTransposeLogic.transform('a,b\n1,2')).toBe('a,1\nb,2');
  });

  it('transposes a 2x3 matrix', () => {
    expect(csvTransposeLogic.transform('1,2,3\n4,5,6')).toBe('1,4\n2,5\n3,6');
  });

  it('pads ragged rows with empty strings', () => {
    expect(csvTransposeLogic.transform('a,b,c\nd')).toBe('a,d\nb,\nc,');
  });

  it('handles a single column', () => {
    expect(csvTransposeLogic.transform('x\ny\nz')).toBe('x,y,z');
  });

  it('throws on empty input', () => {
    expect(() => csvTransposeLogic.transform('')).toThrow();
  });
});
