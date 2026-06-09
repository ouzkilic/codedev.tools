import { describe, it, expect } from 'vitest';
import { aspectRatioLogic } from './logic';

describe('aspectRatioLogic', () => {
  // --- happy paths: simplification ---
  it('simplifies 1920x1080 to 16:9', () => {
    expect(aspectRatioLogic.transform('1920x1080')).toContain('Ratio: 16:9');
  });

  it('simplifies 1280x720 to 16:9', () => {
    expect(aspectRatioLogic.transform('1280x720')).toContain('16:9');
  });

  it('simplifies 3840x2160 (4K) to 16:9', () => {
    expect(aspectRatioLogic.transform('3840x2160')).toContain('Ratio: 16:9');
  });

  it('keeps 4:3 with colon separator', () => {
    expect(aspectRatioLogic.transform('4:3')).toContain('Ratio: 4:3');
  });

  it('simplifies 1024x768 to 4:3', () => {
    expect(aspectRatioLogic.transform('1024x768')).toContain('Ratio: 4:3');
  });

  it('simplifies a square to 1:1', () => {
    expect(aspectRatioLogic.transform('500x500')).toContain('Ratio: 1:1');
  });

  it('simplifies 100x50 to 2:1', () => {
    expect(aspectRatioLogic.transform('100x50')).toContain('Ratio: 2:1');
  });

  it('handles a tall (portrait) ratio 1080x1920 -> 9:16', () => {
    expect(aspectRatioLogic.transform('1080x1920')).toContain('Ratio: 9:16');
  });

  // --- separators: x, X, : ---
  it('accepts uppercase X separator', () => {
    expect(aspectRatioLogic.transform('1920X1080')).toContain('Ratio: 16:9');
  });

  it('accepts lowercase x separator', () => {
    expect(aspectRatioLogic.transform('16x9')).toContain('Ratio: 16:9');
  });

  it('accepts colon separator', () => {
    expect(aspectRatioLogic.transform('16:9')).toContain('Ratio: 16:9');
  });

  // --- whitespace handling ---
  it('trims surrounding whitespace', () => {
    expect(aspectRatioLogic.transform('  1920x1080  ')).toContain('Ratio: 16:9');
  });

  it('trims whitespace around each operand', () => {
    expect(aspectRatioLogic.transform(' 16 : 9 ')).toContain('Ratio: 16:9');
  });

  // --- decimal output ---
  it('outputs decimal to 4 dp for 16:9', () => {
    expect(aspectRatioLogic.transform('1920x1080')).toContain('Decimal: 1.7778');
  });

  it('outputs decimal 1.0000 for a square', () => {
    expect(aspectRatioLogic.transform('500x500')).toContain('Decimal: 1.0000');
  });

  it('outputs decimal 1.3333 for 4:3', () => {
    expect(aspectRatioLogic.transform('4:3')).toContain('Decimal: 1.3333');
  });

  it('outputs decimal 0.5625 for portrait 9:16', () => {
    expect(aspectRatioLogic.transform('9:16')).toContain('Decimal: 0.5625');
  });

  // --- full output structure ---
  it('produces a two-line Ratio/Decimal output', () => {
    const out = aspectRatioLogic.transform('100x50');
    expect(out).toBe('Ratio: 2:1\nDecimal: 2.0000');
  });

  it('is deterministic across repeated calls', () => {
    const a = aspectRatioLogic.transform('1920x1080');
    const b = aspectRatioLogic.transform('1920x1080');
    expect(a).toBe(b);
  });

  // --- numeric coercion quirks (Number()) ---
  it('accepts a leading + sign on operands', () => {
    expect(aspectRatioLogic.transform('+16:9')).toContain('Ratio: 16:9');
  });

  it('accepts exponential notation that yields an integer', () => {
    // Number('1e3') === 1000 which is an integer
    expect(aspectRatioLogic.transform('1e3x1')).toContain('Ratio: 1000:1');
  });

  // --- error paths ---
  it('throws on non-numeric input', () => {
    expect(() => aspectRatioLogic.transform('abc')).toThrow();
  });

  it('throws on empty string (only one part)', () => {
    expect(() => aspectRatioLogic.transform('')).toThrow(/format/);
  });

  it('throws on whitespace-only input', () => {
    expect(() => aspectRatioLogic.transform('   ')).toThrow(/format/);
  });

  it('throws when there are too many separators', () => {
    expect(() => aspectRatioLogic.transform('1:2:3')).toThrow(/format/);
  });

  it('throws when a separator is missing (single value)', () => {
    expect(() => aspectRatioLogic.transform('1080')).toThrow(/format/);
  });

  it('throws on a leading separator (empty width -> 0)', () => {
    expect(() => aspectRatioLogic.transform('x1080')).toThrow(/positive integers/);
  });

  it('throws on a trailing separator (empty height -> 0)', () => {
    expect(() => aspectRatioLogic.transform('1920x')).toThrow(/positive integers/);
  });

  it('throws on zero dimension', () => {
    expect(() => aspectRatioLogic.transform('0x10')).toThrow(/positive integers/);
  });

  it('throws on negative dimension', () => {
    expect(() => aspectRatioLogic.transform('-16:9')).toThrow(/positive integers/);
  });

  it('throws on non-integer (decimal) dimension', () => {
    expect(() => aspectRatioLogic.transform('1.5x2')).toThrow(/positive integers/);
  });

  it('throws on emoji / unicode operands', () => {
    expect(() => aspectRatioLogic.transform('😀x9')).toThrow(/positive integers/);
  });

  it('throws on underscore-separated numbers (Number -> NaN)', () => {
    expect(() => aspectRatioLogic.transform('1_000x500')).toThrow(/positive integers/);
  });

  // --- large input ---
  it('handles very large dimensions', () => {
    expect(aspectRatioLogic.transform('1000000x500000')).toContain('Ratio: 2:1');
  });
});
