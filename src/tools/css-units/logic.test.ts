import { describe, it, expect } from 'vitest';
import { cssUnitsLogic } from './logic';

const conv = (s: string, base = '16') => cssUnitsLogic.transform(s, { options: { base }, secondary: '' });

describe('cssUnits', () => {
  it('converts px to rem at the default base', () => {
    const out = conv('16px');
    expect(out).toContain('px:   16px');
    expect(out).toContain('rem:  1rem');
  });
  it('converts rem to px', () => {
    expect(conv('2rem')).toContain('px:   32px');
  });
  it('respects a custom root font size', () => {
    expect(conv('20px', '10')).toContain('rem:  2rem');
  });
  it('assumes px when no unit is given', () => {
    expect(conv('24')).toContain('rem:  1.5rem');
  });
  it('throws on invalid input', () => {
    expect(() => conv('abc')).toThrow();
  });
});
