import { describe, it, expect } from 'vitest';
import { BARCODE_FORMATS } from './logic';
import type { BarcodeFormat } from './logic';

describe('barcode BARCODE_FORMATS', () => {
  it('offers common formats', () => {
    expect(BARCODE_FORMATS).toContain('CODE128');
    expect(BARCODE_FORMATS).toContain('EAN13');
  });

  it('has several formats', () => {
    expect(BARCODE_FORMATS.length).toBeGreaterThanOrEqual(5);
  });

  it('contains exactly the expected nine formats in order', () => {
    expect(BARCODE_FORMATS).toEqual([
      'CODE128',
      'CODE39',
      'EAN13',
      'EAN8',
      'UPC',
      'ITF14',
      'MSI',
      'pharmacode',
      'codabar',
    ]);
  });

  it('has exactly nine formats', () => {
    expect(BARCODE_FORMATS.length).toBe(9);
  });

  it('lists CODE128 first as the default-friendly format', () => {
    expect(BARCODE_FORMATS[0]).toBe('CODE128');
  });

  it('includes each individually expected format', () => {
    for (const f of [
      'CODE128',
      'CODE39',
      'EAN13',
      'EAN8',
      'UPC',
      'ITF14',
      'MSI',
      'pharmacode',
      'codabar',
    ]) {
      expect(BARCODE_FORMATS).toContain(f);
    }
  });

  it('contains no duplicate format identifiers', () => {
    const unique = new Set<string>(BARCODE_FORMATS);
    expect(unique.size).toBe(BARCODE_FORMATS.length);
  });

  it('contains only non-empty trimmed string entries', () => {
    for (const f of BARCODE_FORMATS) {
      expect(typeof f).toBe('string');
      expect(f.length).toBeGreaterThan(0);
      expect(f).toBe(f.trim());
    }
  });

  it('uses only safe identifier characters (no whitespace or separators)', () => {
    for (const f of BARCODE_FORMATS) {
      expect(f).toMatch(/^[A-Za-z0-9]+$/);
    }
  });

  it('does not include EAN5 or QR-style 2D formats', () => {
    expect(BARCODE_FORMATS).not.toContain('EAN5');
    expect(BARCODE_FORMATS).not.toContain('QR');
    expect(BARCODE_FORMATS).not.toContain('qrcode');
  });

  it('exposes the EAN family alongside UPC', () => {
    expect(BARCODE_FORMATS).toContain('EAN13');
    expect(BARCODE_FORMATS).toContain('EAN8');
    expect(BARCODE_FORMATS).toContain('UPC');
  });

  it('exposes the lowercase-named formats verbatim (case sensitive)', () => {
    expect(BARCODE_FORMATS).toContain('pharmacode');
    expect(BARCODE_FORMATS).toContain('codabar');
    expect(BARCODE_FORMATS).not.toContain('PHARMACODE');
    expect(BARCODE_FORMATS).not.toContain('Codabar');
  });

  it('places EAN13 at the third position', () => {
    expect(BARCODE_FORMATS.indexOf('EAN13')).toBe(2);
  });

  it('is iterable and yields the same values as indexed access', () => {
    const collected: string[] = [];
    for (const f of BARCODE_FORMATS) collected.push(f);
    expect(collected).toEqual(Array.from(BARCODE_FORMATS));
  });

  it('every entry is assignable to the BarcodeFormat type', () => {
    // Compile-time + runtime check: each member round-trips through the type.
    const all: BarcodeFormat[] = BARCODE_FORMATS.map((f) => f);
    expect(all).toEqual([...BARCODE_FORMATS]);
  });

  it('is deterministic: repeated reads return identical contents', () => {
    const first = [...BARCODE_FORMATS];
    const second = [...BARCODE_FORMATS];
    expect(first).toEqual(second);
  });

  it('reports membership consistently via includes', () => {
    expect((BARCODE_FORMATS as readonly string[]).includes('CODE39')).toBe(true);
    expect((BARCODE_FORMATS as readonly string[]).includes('code39')).toBe(false);
    expect((BARCODE_FORMATS as readonly string[]).includes('')).toBe(false);
  });
});
