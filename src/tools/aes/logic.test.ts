import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { aesLogic } from './logic';

const enc = (input: string, secondary: string): Promise<string> =>
  aesLogic.transform(input, { options: { mode: 'encrypt' }, secondary });

const dec = (input: string, secondary: string): Promise<string> =>
  aesLogic.transform(input, { options: { mode: 'decrypt' }, secondary });

/** A blob is base64 of salt(16) + iv(12) + ciphertext(>=16 GCM tag). */
function decodedByteLength(b64: string): number {
  return atob(b64).length;
}

describe('aesLogic metadata', () => {
  it('exposes a passphrase secondary input', () => {
    expect(aesLogic.secondary?.label).toBe('Passphrase');
    expect(aesLogic.secondary?.placeholder).toBeDefined();
  });

  it('exposes a mode select option defaulting to encrypt', () => {
    const opt = aesLogic.options?.find((o) => o.key === 'mode');
    expect(opt).toBeDefined();
    expect(opt?.type).toBe('select');
    expect(opt?.default).toBe('encrypt');
    expect(opt?.choices?.map((c) => c.value)).toEqual(['encrypt', 'decrypt']);
  });
});

describe('aesLogic encrypt', () => {
  it('produces valid base64 output', async () => {
    const out = await enc('hello secret', 'pw');
    expect(out).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(() => atob(out)).not.toThrow();
  });

  it('output carries at least salt(16)+iv(12)+tag(16) = 44 bytes for empty plaintext', async () => {
    const out = await enc('', 'pw');
    // empty plaintext => ciphertext is just the 16-byte GCM tag
    expect(decodedByteLength(out)).toBe(16 + 12 + 16);
  });

  it('grows the ciphertext by one byte per added ASCII char', async () => {
    const a = await enc('a', 'pw');
    const ab = await enc('ab', 'pw');
    expect(decodedByteLength(ab) - decodedByteLength(a)).toBe(1);
  });

  it('is non-deterministic (random salt + iv) for the same input', async () => {
    const a = await enc('same input', 'pw');
    const b = await enc('same input', 'pw');
    expect(a).not.toBe(b);
  });

  it('defaults to encrypt mode when mode option is absent', async () => {
    const out = await aesLogic.transform('plain', { options: {}, secondary: 'pw' } as ToolContext);
    expect(out).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    // round-trips as an encrypted blob
    expect(await dec(out, 'pw')).toBe('plain');
  });

  it('treats unknown mode value as non-decrypt (falls through to encrypt)', async () => {
    const out = await aesLogic.transform('plain', {
      options: { mode: 'bogus' },
      secondary: 'pw',
    });
    expect(await dec(out, 'pw')).toBe('plain');
  });
});

describe('aesLogic round-trips', () => {
  it('round-trips simple ASCII', async () => {
    const out = await enc('hello secret', 'pw');
    expect(await dec(out, 'pw')).toBe('hello secret');
  });

  it('round-trips empty plaintext', async () => {
    const out = await enc('', 'pw');
    expect(await dec(out, 'pw')).toBe('');
  });

  it('round-trips whitespace-only plaintext', async () => {
    const text = '   \t\n  ';
    const out = await enc(text, 'pw');
    expect(await dec(out, 'pw')).toBe(text);
  });

  it('round-trips unicode and emoji', async () => {
    const text = 'héllo 世界 🚀😀 ñ ü';
    const out = await enc(text, 'pw');
    expect(await dec(out, 'pw')).toBe(text);
  });

  it('round-trips special chars and JSON-like content', async () => {
    const text = '{"a":1,"b":"<>&\'\\"\\n\\t"}';
    const out = await enc(text, 'pw');
    expect(await dec(out, 'pw')).toBe(text);
  });

  it('round-trips a very large input (forces multi-chunk base64)', async () => {
    // > 0x8000 bytes exercises the chunked toB64 loop
    const text = 'A'.repeat(100000);
    const out = await enc(text, 'pw');
    const back = await dec(out, 'pw');
    expect(back.length).toBe(100000);
    expect(back).toBe(text);
  });

  it('round-trips with a unicode passphrase', async () => {
    const out = await enc('secret data', 'pärola-密码-🔐');
    expect(await dec(out, 'pärola-密码-🔐')).toBe('secret data');
  });

  it('round-trips with a very long passphrase', async () => {
    const pass = 'p'.repeat(5000);
    const out = await enc('hi', pass);
    expect(await dec(out, pass)).toBe('hi');
  });

  it('tolerates surrounding whitespace on the ciphertext when decrypting', async () => {
    const out = await enc('trim me', 'pw');
    expect(await dec(`  \n ${out} \t\n`, 'pw')).toBe('trim me');
  });
});

describe('aesLogic error paths', () => {
  it('throws a clear message when passphrase is empty on encrypt', async () => {
    await expect(enc('hello', '')).rejects.toThrow('Enter a passphrase.');
  });

  it('throws a clear message when passphrase is empty on decrypt', async () => {
    await expect(dec('anything', '')).rejects.toThrow('Enter a passphrase.');
  });

  it('rejects decrypt with the wrong passphrase (GCM auth fails)', async () => {
    const out = await enc('hello secret', 'pw');
    await expect(dec(out, 'wrong')).rejects.toBeDefined();
  });

  it('rejects decrypt of a tampered ciphertext', async () => {
    const out = await enc('hello secret', 'pw');
    const bytes = atob(out);
    // flip a byte well inside the ciphertext region (index > 28)
    const arr = bytes.split('');
    const i = bytes.length - 1;
    arr[i] = String.fromCharCode(bytes.charCodeAt(i) ^ 0xff);
    const tampered = btoa(arr.join(''));
    await expect(dec(tampered, 'pw')).rejects.toBeDefined();
  });

  it('rejects decrypt of malformed base64', async () => {
    // '@@@' is not valid base64 -> atob throws
    await expect(dec('@@@not base64@@@', 'pw')).rejects.toBeDefined();
  });

  it('rejects decrypt of an empty / structurally-too-short blob', async () => {
    // valid base64 but decodes to too few bytes for salt+iv+tag
    await expect(dec('', 'pw')).rejects.toBeDefined();
  });

  it('rejects decrypt of random valid-base64 garbage (no valid GCM tag)', async () => {
    // 44 bytes of zeros: structurally sized but fails authentication
    const garbage = btoa(String.fromCharCode(...new Array(44).fill(0)));
    await expect(dec(garbage, 'pw')).rejects.toBeDefined();
  });
});

describe('aesLogic determinism of decrypt', () => {
  it('decrypts the same blob to the same plaintext repeatedly', async () => {
    const out = await enc('repeatable', 'pw');
    const a = await dec(out, 'pw');
    const b = await dec(out, 'pw');
    expect(a).toBe('repeatable');
    expect(b).toBe('repeatable');
  });
});
