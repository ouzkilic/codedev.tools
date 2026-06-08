import { describe, it, expect } from 'vitest';
import { generateKeyPair } from './logic';

describe('keygen', () => {
  it('generates an EC P-256 key pair in PEM', async () => {
    const { publicKey, privateKey } = await generateKeyPair('EC-P256');
    expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    expect(publicKey).toContain('-----END PUBLIC KEY-----');
    expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
  });
  it('generates unique key pairs', async () => {
    const a = await generateKeyPair('EC-P256');
    const b = await generateKeyPair('EC-P256');
    expect(a.privateKey).not.toBe(b.privateKey);
  });
  it('supports RSA', async () => {
    const { publicKey } = await generateKeyPair('RSA-2048');
    expect(publicKey).toContain('BEGIN PUBLIC KEY');
  });
});
