import { describe, it, expect } from 'vitest';
import type { ToolContext, ToolOptions } from '@/hooks/useToolState';
import { pbkdf2Logic } from './logic';

function ctx(options: ToolOptions, secondary = ''): ToolContext {
  return { options, secondary };
}

const HEX = /^[0-9a-f]*$/;

describe('pbkdf2Logic', () => {
  it('derives a known PBKDF2-HMAC-SHA256 vector (iterations=1)', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '1', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toBe('120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b');
  });

  it('derives the known SHA-256 vector for iterations=2', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '2', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toBe('ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43');
  });

  it('derives the known SHA-256 vector for iterations=4096', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '4096', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toBe('c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a');
  });

  it('derives the known SHA-256 vector for the default iterations=100000', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '100000', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toBe('0394a2ede332c9a13eb82e9b24631604c31df978b4e2f0fbd2c549944f9d79a5');
  });

  it('supports SHA-1 with a 160-bit key', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '1', hash: 'SHA-1', keyBits: '160' }),
    );
    expect(out).toBe('0c60c80f961f0e71f3a9b524af6012062fe037a6');
    expect(out).toHaveLength(40);
  });

  it('supports SHA-384 with a 384-bit key', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '1', hash: 'SHA-384', keyBits: '384' }),
    );
    expect(out).toBe(
      'c0e14f06e49e32d73f9f52ddf1d0c5c7191609233631dadd76a567db42b78676b38fc800cc53ddb642f5c74442e62be4',
    );
    expect(out).toHaveLength(96);
  });

  it('supports SHA-512 with a 512-bit key', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '1', hash: 'SHA-512', keyBits: '512' }),
    );
    expect(out).toBe(
      '867f70cf1ade02cff3752599a3a53dc4af34c7a669815ae5d513554e1c8cf252c02d470a285a0501bad999bfe943c08f050235d7d68b1da55e63f73b60a57fce',
    );
    expect(out).toHaveLength(128);
  });

  it('outputs hex with two chars per derived byte (keyBits/4)', async () => {
    for (const bits of [128, 256, 512]) {
      const out = await pbkdf2Logic.transform(
        'password',
        ctx({ salt: 'salt', iterations: '1', hash: 'SHA-256', keyBits: String(bits) }),
      );
      expect(out).toMatch(HEX);
      expect(out).toHaveLength(bits / 4);
    }
  });

  it('derives an 8-bit (single byte) key', async () => {
    const out = await pbkdf2Logic.transform(
      'a',
      ctx({ salt: 'salt', iterations: '1', hash: 'SHA-256', keyBits: '8' }),
    );
    expect(out).toBe('5f');
    expect(out).toHaveLength(2);
  });

  it('handles an empty password string', async () => {
    const out = await pbkdf2Logic.transform(
      '',
      ctx({ salt: 'salt', iterations: '1', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toBe('f135c27993baf98773c5cdb40a5706ce6a345cde61b000a67858650cd6a324d7');
  });

  it('handles an empty salt', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: '', iterations: '1', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toBe('c1232f10f62715fda06ae7c0a2037ca19b33cf103b727ba56d870c11f290a2ab');
  });

  it('is deterministic: identical inputs yield identical output', async () => {
    const opts = ctx({ salt: 'salt', iterations: '50', hash: 'SHA-256', keyBits: '256' });
    const a = await pbkdf2Logic.transform('repeat-me', opts);
    const b = await pbkdf2Logic.transform('repeat-me', opts);
    expect(a).toBe(b);
  });

  it('changing the salt changes the output', async () => {
    const a = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt-a', iterations: '10', hash: 'SHA-256', keyBits: '256' }),
    );
    const b = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt-b', iterations: '10', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(a).not.toBe(b);
  });

  it('changing the hash algorithm changes the output', async () => {
    const sha256 = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '10', hash: 'SHA-256', keyBits: '256' }),
    );
    const sha512 = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '10', hash: 'SHA-512', keyBits: '256' }),
    );
    expect(sha256).not.toBe(sha512);
  });

  it('handles unicode/emoji passwords (UTF-8 encoded)', async () => {
    const out = await pbkdf2Logic.transform(
      'héllo🔐',
      ctx({ salt: 'salt', iterations: '100', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toBe('d07521d90e9a2753790daf3dce1df8cf5b14c96cc619eb12a3a0610033d0c191');
  });

  it('handles NUL bytes in password and salt', async () => {
    const out = await pbkdf2Logic.transform(
      'pass\0word',
      ctx({ salt: 'sa\0lt', iterations: '4096', hash: 'SHA-256', keyBits: '128' }),
    );
    expect(out).toBe('89b69d0516f829893c696226650a8687');
  });

  it('handles a very large password input without crashing', async () => {
    const big = 'x'.repeat(100000);
    const out = await pbkdf2Logic.transform(
      big,
      ctx({ salt: 'salt', iterations: '1', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toMatch(HEX);
    expect(out).toHaveLength(64);
  });

  // --- fallback / coercion branches ---

  it('falls back to iterations=1 when iterations is non-numeric', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: 'abc', hash: 'SHA-256', keyBits: '256' }),
    );
    // parseInt('abc') -> NaN -> || 1, so equals the iterations=1 vector
    expect(out).toBe('120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b');
  });

  it('falls back to iterations=1 when iterations is "0"', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '0', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toBe('120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b');
  });

  it('parseInt truncates a decimal iterations value', async () => {
    // parseInt('10.9') -> 10
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '10.9', hash: 'SHA-256', keyBits: '256' }),
    );
    expect(out).toBe('653cc888d937efe22810a5cbdb25a5bd82e2ebb27a800f85cfa360a6d925198e');
  });

  it('falls back to keyBits=256 when keyBits is non-numeric', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '1', hash: 'SHA-256', keyBits: 'abc' }),
    );
    expect(out).toBe('120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b');
    expect(out).toHaveLength(64);
  });

  it('falls back to keyBits=256 when keyBits is "0"', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: '1', hash: 'SHA-256', keyBits: '0' }),
    );
    expect(out).toBe('120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b');
  });

  it('uses code defaults (salt=salt, iter=100000, SHA-256, 256) when options are missing', async () => {
    // ?? defaults: salt -> 'salt', iterations -> '100000', hash -> 'SHA-256', keyBits -> '256'
    const out = await pbkdf2Logic.transform('password', ctx({}));
    expect(out).toBe('0394a2ede332c9a13eb82e9b24631604c31df978b4e2f0fbd2c549944f9d79a5');
  });

  it('coerces numeric option values via String()', async () => {
    const out = await pbkdf2Logic.transform(
      'password',
      ctx({ salt: 'salt', iterations: 1 as unknown as string, hash: 'SHA-256', keyBits: 256 as unknown as string }),
    );
    expect(out).toBe('120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b');
  });

  // --- error paths ---

  it('throws when keyBits is not a multiple of 8', async () => {
    await expect(
      pbkdf2Logic.transform(
        'password',
        ctx({ salt: 'salt', iterations: '1', hash: 'SHA-256', keyBits: '100' }),
      ),
    ).rejects.toThrow();
  });

  it('throws when the hash algorithm is unsupported', async () => {
    await expect(
      pbkdf2Logic.transform(
        'password',
        ctx({ salt: 'salt', iterations: '1', hash: 'SHA-999', keyBits: '256' }),
      ),
    ).rejects.toThrow();
  });

  // --- option metadata sanity ---

  it('declares the expected options and defaults', () => {
    const opts = pbkdf2Logic.options ?? [];
    const byKey = Object.fromEntries(opts.map((o) => [o.key, o]));
    expect(byKey.salt?.default).toBe('salt');
    expect(byKey.iterations?.default).toBe('100000');
    expect(byKey.keyBits?.default).toBe('256');
    expect(byKey.hash?.type).toBe('select');
    const hashChoices = (byKey.hash?.choices ?? []).map((c) => c.value);
    expect(hashChoices).toEqual(['SHA-256', 'SHA-1', 'SHA-384', 'SHA-512']);
  });
});
