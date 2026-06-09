import { describe, it, expect } from 'vitest';
import { generateKeyPair } from './logic';
import type { KeyPair } from './logic';

const PEM_BODY = /^[A-Za-z0-9+/]+={0,2}$/;

function pemBody(pem: string): string {
  return pem
    .split('\n')
    .filter((line) => !line.startsWith('-----'))
    .join('');
}

function stripPem(pem: string, label: string): string {
  expect(pem.startsWith(`-----BEGIN ${label}-----\n`)).toBe(true);
  expect(pem.endsWith(`\n-----END ${label}-----`)).toBe(true);
  return pemBody(pem);
}

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

  it('returns a KeyPair object with exactly publicKey and privateKey strings', async () => {
    const pair: KeyPair = await generateKeyPair('EC-P256');
    expect(Object.keys(pair).sort()).toEqual(['privateKey', 'publicKey']);
    expect(typeof pair.publicKey).toBe('string');
    expect(typeof pair.privateKey).toBe('string');
  });

  it('uses PUBLIC KEY label for the public key and PRIVATE KEY label for the private key', async () => {
    const { publicKey, privateKey } = await generateKeyPair('EC-P256');
    expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    expect(publicKey).toContain('-----END PUBLIC KEY-----');
    expect(publicKey).not.toContain('PRIVATE KEY');
    expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
    expect(privateKey).toContain('-----END PRIVATE KEY-----');
    expect(privateKey).not.toContain('PUBLIC KEY');
  });

  it('produces PEM with no trailing newline and a leading newline after the header', async () => {
    const { publicKey } = await generateKeyPair('EC-P256');
    expect(publicKey.endsWith('\n')).toBe(false);
    expect(publicKey.startsWith('-----BEGIN PUBLIC KEY-----\n')).toBe(true);
    expect(publicKey.endsWith('\n-----END PUBLIC KEY-----')).toBe(true);
  });

  it('wraps base64 body lines at no more than 64 characters', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RSA-2048');
    for (const pem of [publicKey, privateKey]) {
      const bodyLines = pem.split('\n').filter((l) => !l.startsWith('-----'));
      expect(bodyLines.length).toBeGreaterThan(0);
      for (const line of bodyLines) {
        expect(line.length).toBeGreaterThan(0);
        expect(line.length).toBeLessThanOrEqual(64);
      }
      // all body lines except possibly the last must be exactly 64
      for (let i = 0; i < bodyLines.length - 1; i++) {
        expect(bodyLines[i].length).toBe(64);
      }
    }
  });

  it('PEM body is valid base64 for both keys', async () => {
    const { publicKey, privateKey } = await generateKeyPair('EC-P256');
    expect(pemBody(publicKey)).toMatch(PEM_BODY);
    expect(pemBody(privateKey)).toMatch(PEM_BODY);
  });

  it('PEM body decodes back to non-empty DER bytes (round-trip through base64)', async () => {
    const { publicKey, privateKey } = await generateKeyPair('EC-P256');
    const pubDer = Buffer.from(stripPem(publicKey, 'PUBLIC KEY'), 'base64');
    const privDer = Buffer.from(stripPem(privateKey, 'PRIVATE KEY'), 'base64');
    expect(pubDer.length).toBeGreaterThan(0);
    expect(privDer.length).toBeGreaterThan(0);
    // re-encoding the DER must reproduce the exact base64 body
    expect(pubDer.toString('base64')).toBe(stripPem(publicKey, 'PUBLIC KEY'));
    expect(privDer.toString('base64')).toBe(stripPem(privateKey, 'PRIVATE KEY'));
  });

  it('exports public key as SPKI (DER begins with SEQUENCE tag 0x30)', async () => {
    const { publicKey } = await generateKeyPair('EC-P256');
    const der = Buffer.from(pemBody(publicKey), 'base64');
    expect(der[0]).toBe(0x30);
  });

  it('exports private key as PKCS8 (DER begins with SEQUENCE tag 0x30)', async () => {
    const { privateKey } = await generateKeyPair('EC-P256');
    const der = Buffer.from(pemBody(privateKey), 'base64');
    expect(der[0]).toBe(0x30);
  });

  it('generates an EC P-384 key pair', async () => {
    const { publicKey, privateKey } = await generateKeyPair('EC-P384');
    expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
  });

  it('P-384 public key DER is larger than P-256 public key DER', async () => {
    const p256 = await generateKeyPair('EC-P256');
    const p384 = await generateKeyPair('EC-P384');
    const len256 = Buffer.from(pemBody(p256.publicKey), 'base64').length;
    const len384 = Buffer.from(pemBody(p384.publicKey), 'base64').length;
    expect(len384).toBeGreaterThan(len256);
  });

  it('generates an RSA-2048 key pair with both keys', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RSA-2048');
    expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
  });

  it('generates an RSA-4096 key pair larger than RSA-2048', async () => {
    const rsa2048 = await generateKeyPair('RSA-2048');
    const rsa4096 = await generateKeyPair('RSA-4096');
    const len2048 = Buffer.from(pemBody(rsa2048.privateKey), 'base64').length;
    const len4096 = Buffer.from(pemBody(rsa4096.privateKey), 'base64').length;
    expect(len4096).toBeGreaterThan(len2048);
  }, 30000);

  it('treats any non-RSA-prefixed algorithm as EC P-256 (default branch)', async () => {
    // "EC-P256" and an unknown EC-ish value both fall to P-256 default
    const named = await generateKeyPair('EC-P256');
    const fallback = await generateKeyPair('SOMETHING-ELSE');
    const lenNamed = Buffer.from(pemBody(named.publicKey), 'base64').length;
    const lenFallback = Buffer.from(pemBody(fallback.publicKey), 'base64').length;
    // both are P-256 so the SPKI public key DER length matches
    expect(lenFallback).toBe(lenNamed);
  });

  it('empty-string algorithm falls into EC default branch (P-256)', async () => {
    const empty = await generateKeyPair('');
    const p256 = await generateKeyPair('EC-P256');
    const lenEmpty = Buffer.from(pemBody(empty.publicKey), 'base64').length;
    const lenP256 = Buffer.from(pemBody(p256.publicKey), 'base64').length;
    expect(lenEmpty).toBe(lenP256);
    expect(empty.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
  });

  it('any RSA-prefixed value that is not RSA-4096 defaults to modulus 2048', async () => {
    const exact = await generateKeyPair('RSA-2048');
    const other = await generateKeyPair('RSA-WHATEVER');
    const lenExact = Buffer.from(pemBody(exact.publicKey), 'base64').length;
    const lenOther = Buffer.from(pemBody(other.publicKey), 'base64').length;
    // same 2048 modulus -> identical SPKI public key DER length
    expect(lenOther).toBe(lenExact);
  });

  it('RSA public keys are deterministic in structure but unique in content', async () => {
    const a = await generateKeyPair('RSA-2048');
    const b = await generateKeyPair('RSA-2048');
    expect(a.publicKey).not.toBe(b.publicKey);
    expect(a.privateKey).not.toBe(b.privateKey);
    // structural label markers identical
    expect(a.publicKey.startsWith('-----BEGIN PUBLIC KEY-----')).toBe(true);
    expect(b.publicKey.startsWith('-----BEGIN PUBLIC KEY-----')).toBe(true);
  });

  it('EC P-384 keys are unique across calls', async () => {
    const a = await generateKeyPair('EC-P384');
    const b = await generateKeyPair('EC-P384');
    expect(a.privateKey).not.toBe(b.privateKey);
    expect(a.publicKey).not.toBe(b.publicKey);
  });

  it('PEM contains no carriage returns (uses LF only)', async () => {
    const { publicKey, privateKey } = await generateKeyPair('EC-P256');
    expect(publicKey).not.toContain('\r');
    expect(privateKey).not.toContain('\r');
  });

  it('public and private key bodies differ for the same pair', async () => {
    const { publicKey, privateKey } = await generateKeyPair('EC-P256');
    expect(pemBody(publicKey)).not.toBe(pemBody(privateKey));
  });
});
