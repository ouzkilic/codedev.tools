import { describe, it, expect } from 'vitest';
import { argon2Logic } from './logic';

describe('argon2Logic', () => {
  it('produces an Argon2id encoded hash', async () => {
    const out = await argon2Logic.transform('password', { options: {}, secondary: '' });
    expect(out.startsWith('$argon2id$')).toBe(true);
  });

  it('uses a random salt so two hashes differ', async () => {
    const a = await argon2Logic.transform('password', { options: {}, secondary: '' });
    const b = await argon2Logic.transform('password', { options: {}, secondary: '' });
    expect(a).not.toBe(b);
  });
});
