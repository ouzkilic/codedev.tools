import { describe, expect, it } from 'vitest';
import { aesLogic } from './logic';

describe('aesLogic', () => {
  it('round-trips encrypt then decrypt', async () => {
    const enc = await aesLogic.transform('hello secret', {
      options: { mode: 'encrypt' },
      secondary: 'pw',
    });
    expect(
      await aesLogic.transform(enc, { options: { mode: 'decrypt' }, secondary: 'pw' }),
    ).toBe('hello secret');
  });

  it('rejects decrypt with a wrong passphrase', async () => {
    const enc = await aesLogic.transform('hello secret', {
      options: { mode: 'encrypt' },
      secondary: 'pw',
    });
    await expect(
      aesLogic.transform(enc, { options: { mode: 'decrypt' }, secondary: 'wrong' }),
    ).rejects.toBeDefined();
  });

  it('throws when no passphrase is provided', async () => {
    await expect(
      aesLogic.transform('hello', { options: { mode: 'encrypt' }, secondary: '' }),
    ).rejects.toThrow('Enter a passphrase.');
  });
});
