import { describe, it, expect } from 'vitest';
import { aspectRatioLogic } from './logic';

describe('aspectRatioLogic', () => {
  it('simplifies 1920x1080 to 16:9', () => {
    expect(aspectRatioLogic.transform('1920x1080')).toContain('Ratio: 16:9');
  });

  it('simplifies 1280x720 to 16:9', () => {
    expect(aspectRatioLogic.transform('1280x720')).toContain('16:9');
  });

  it('keeps 4:3 with colon separator', () => {
    expect(aspectRatioLogic.transform('4:3')).toContain('Ratio: 4:3');
  });

  it('outputs decimal to 4 dp', () => {
    expect(aspectRatioLogic.transform('1920x1080')).toContain('Decimal: 1.7778');
  });

  it('throws on non-numeric input', () => {
    expect(() => aspectRatioLogic.transform('abc')).toThrow();
  });
});
