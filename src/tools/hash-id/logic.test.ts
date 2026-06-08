import { describe, it, expect } from 'vitest';
import { hashIdLogic } from './logic';

const run = (input: string) => hashIdLogic.transform(input, { options: {}, secondary: '' });

describe('hashIdLogic', () => {
  it('identifies an MD5 hash', () => {
    expect(run('5d41402abc4b2a76b9719d911017c592')).toContain('MD5');
  });

  it('identifies a SHA-256 hash by 64 hex chars', () => {
    expect(run('a'.repeat(64))).toContain('SHA-256');
  });

  it('identifies a bcrypt hash by prefix', () => {
    expect(run('$2b$10$abcdefghijklmnopqrstuv')).toContain('bcrypt');
  });

  it('returns empty for blank input', () => {
    expect(run('   ')).toBe('');
  });

  it('flags non-hex input as unknown', () => {
    expect(run('not a hash!')).toContain('Unknown');
  });
});
