import { describe, it, expect } from 'vitest';
import { BARCODE_FORMATS } from './logic';

describe('barcode', () => {
  it('offers common formats', () => {
    expect(BARCODE_FORMATS).toContain('CODE128');
    expect(BARCODE_FORMATS).toContain('EAN13');
  });
  it('has several formats', () => {
    expect(BARCODE_FORMATS.length).toBeGreaterThanOrEqual(5);
  });
});
