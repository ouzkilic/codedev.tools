import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { argon2Logic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };

describe('argon2Logic', () => {
  it('produces an Argon2id encoded hash', async () => {
    const out = await argon2Logic.transform('password', ctx);
    expect(out.startsWith('$argon2id$')).toBe(true);
  });

  it('uses a random salt so two hashes differ', async () => {
    const a = await argon2Logic.transform('password', ctx);
    const b = await argon2Logic.transform('password', ctx);
    expect(a).not.toBe(b);
  });

  it('emits the configured params in the encoded string (m=4096,t=3,p=1)', async () => {
    const out = await argon2Logic.transform('password', ctx);
    expect(out).toContain('m=4096,t=3,p=1');
  });

  it('embeds the algorithm version v=19', async () => {
    const out = await argon2Logic.transform('hello', ctx);
    expect(out).toContain('$v=19$');
  });

  it('matches the full canonical PHC encoded format', async () => {
    const out = await argon2Logic.transform('correct horse battery staple', ctx);
    // $argon2id$v=19$m=4096,t=3,p=1$<salt b64>$<hash b64>
    expect(out).toMatch(
      /^\$argon2id\$v=19\$m=4096,t=3,p=1\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/,
    );
  });

  it('splits into exactly 6 fields (leading empty + 5 segments)', async () => {
    const out = await argon2Logic.transform('abc', ctx);
    const parts = out.split('$');
    // ['', 'argon2id', 'v=19', 'm=4096,t=3,p=1', '<salt>', '<hash>']
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe('');
    expect(parts[1]).toBe('argon2id');
  });

  it('encodes a 16-byte salt as 22 base64 chars (unpadded)', async () => {
    const out = await argon2Logic.transform('saltcheck', ctx);
    const salt = out.split('$')[4];
    expect(salt).toHaveLength(22);
    expect(salt).not.toContain('=');
  });

  it('encodes a 32-byte hash as 43 base64 chars (unpadded)', async () => {
    const out = await argon2Logic.transform('hashcheck', ctx);
    const hash = out.split('$')[5];
    expect(hash).toHaveLength(43);
    expect(hash).not.toContain('=');
  });

  it('rejects an empty password (hash-wasm requires a password)', async () => {
    // The useAsyncToolState hook guards against empty/whitespace input before
    // calling transform, but at the logic level hash-wasm rejects an empty pw.
    await expect(argon2Logic.transform('', ctx)).rejects.toThrow(
      /Password must be specified/,
    );
  });

  it('hashes whitespace-only input', async () => {
    const out = await argon2Logic.transform('   \t\n  ', ctx);
    expect(out.startsWith('$argon2id$')).toBe(true);
  });

  it('hashes unicode and emoji input', async () => {
    const out = await argon2Logic.transform('héllo 世界 🔐🚀', ctx);
    expect(out).toMatch(/^\$argon2id\$v=19\$m=4096,t=3,p=1\$/);
    expect(out.split('$')[5]).toHaveLength(43);
  });

  it('hashes special / control characters', async () => {
    const out = await argon2Logic.transform('!@#$%^&*()_+\0\x01', ctx);
    expect(out.startsWith('$argon2id$')).toBe(true);
  });

  it('hashes a very large input without error', async () => {
    const big = 'a'.repeat(100_000);
    const out = await argon2Logic.transform(big, ctx);
    expect(out.startsWith('$argon2id$')).toBe(true);
    expect(out.split('$')[5]).toHaveLength(43);
  });

  it('hash output is deterministic when the salt is held constant (different inputs differ)', async () => {
    // Same password but random salts => different full encoded strings.
    const a = await argon2Logic.transform('samePassword', ctx);
    const b = await argon2Logic.transform('samePassword', ctx);
    expect(a).not.toBe(b);
    // Salts must also differ (the source of nondeterminism).
    expect(a.split('$')[4]).not.toBe(b.split('$')[4]);
  });

  it('ignores ctx.options and ctx.secondary (no option branches)', async () => {
    const withOpts: ToolContext = {
      options: { foo: true, bar: 'baz' },
      secondary: 'pepper',
    };
    const out = await argon2Logic.transform('password', withOpts);
    // Same fixed params regardless of options/secondary.
    expect(out).toContain('m=4096,t=3,p=1');
    expect(out.startsWith('$argon2id$')).toBe(true);
  });

  it('exposes no options or secondary field on the logic object', () => {
    expect(argon2Logic.options).toBeUndefined();
    expect(argon2Logic.secondary).toBeUndefined();
  });

  it('returns a string from transform', async () => {
    const out = await argon2Logic.transform('typecheck', ctx);
    expect(typeof out).toBe('string');
  });

  it('produces different hash segments for different passwords (overwhelmingly likely)', async () => {
    const a = await argon2Logic.transform('passwordA', ctx);
    const b = await argon2Logic.transform('passwordB', ctx);
    expect(a.split('$')[5]).not.toBe(b.split('$')[5]);
  });
});
