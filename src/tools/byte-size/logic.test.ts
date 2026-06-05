import { describe, it, expect } from 'vitest';
import { byteSizeLogic } from './logic';

describe('byteSize', () => {
  it('humanizes a raw byte count', () => {
    const out = byteSizeLogic.transform('1024');
    expect(out).toContain('Bytes:    1024');
    expect(out).toContain('Binary:   1 KiB');
    expect(out).toContain('Decimal:  1.02 KB');
  });
  it('parses a size with a unit back to bytes', () => {
    expect(byteSizeLogic.transform('1 MB')).toContain('Bytes:    1000000');
  });
  it('parses binary units', () => {
    expect(byteSizeLogic.transform('1 MiB')).toContain('Bytes:    1048576');
  });
  it('throws on invalid input', () => {
    expect(() => byteSizeLogic.transform('abc')).toThrow();
  });
});
