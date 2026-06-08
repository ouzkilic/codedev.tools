import { describe, it, expect } from 'vitest';
import { pbkdf2Logic } from './logic';

describe('pbkdf2Logic', () => {
  it('derives a known PBKDF2-HMAC-SHA256 vector', async () => {
    const out = await pbkdf2Logic.transform('password', {
      options: { salt: 'salt', iterations: '1', hash: 'SHA-256', keyBits: '256' },
      secondary: '',
    });
    expect(out.startsWith('120fb6cffcf8b32c43e7225256c4f837')).toBe(true);
  });
});
