import { describe, it, expect } from 'vitest';
import { generatePasswords } from './logic';

const base = { uppercase: true, lowercase: true, numbers: true, symbols: false, count: '1' };

describe('password', () => {
  it('respects the requested length', () => {
    expect(generatePasswords({ ...base, length: '24' })).toHaveLength(24);
  });
  it('uses only digits when only numbers are enabled', () => {
    const pw = generatePasswords({ length: '40', uppercase: false, lowercase: false, numbers: true, symbols: false, count: '1' });
    expect(pw).toMatch(/^[0-9]+$/);
  });
  it('generates multiple passwords on separate lines', () => {
    expect(generatePasswords({ ...base, length: '12', count: '3' }).split('\n')).toHaveLength(3);
  });
  it('throws when no character set is selected', () => {
    expect(() =>
      generatePasswords({ length: '16', uppercase: false, lowercase: false, numbers: false, symbols: false, count: '1' }),
    ).toThrow(/character set/i);
  });
});
