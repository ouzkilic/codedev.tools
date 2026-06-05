import { describe, it, expect } from 'vitest';
import { md5Logic } from './logic';

describe('md5', () => {
  it('hashes a known string', () => {
    expect(md5Logic.transform('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
  });
  it('hashes the empty-ish string consistently', () => {
    expect(md5Logic.transform('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  it('produces a 32-character hex digest', () => {
    expect(md5Logic.transform('codedev.tools')).toMatch(/^[0-9a-f]{32}$/);
  });
});
