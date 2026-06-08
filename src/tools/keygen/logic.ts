function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function toPem(der: ArrayBuffer, label: string): string {
  const b64 = toBase64(new Uint8Array(der));
  const wrapped = b64.match(/.{1,64}/g)?.join('\n') ?? b64;
  return `-----BEGIN ${label}-----\n${wrapped}\n-----END ${label}-----`;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export async function generateKeyPair(algorithm: string): Promise<KeyPair> {
  const params: RsaHashedKeyGenParams | EcKeyGenParams = algorithm.startsWith('RSA')
    ? {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: algorithm === 'RSA-4096' ? 4096 : 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      }
    : { name: 'ECDSA', namedCurve: algorithm === 'EC-P384' ? 'P-384' : 'P-256' };

  const pair = (await crypto.subtle.generateKey(params, true, ['sign', 'verify'])) as CryptoKeyPair;
  const publicKey = toPem(await crypto.subtle.exportKey('spki', pair.publicKey), 'PUBLIC KEY');
  const privateKey = toPem(await crypto.subtle.exportKey('pkcs8', pair.privateKey), 'PRIVATE KEY');
  return { publicKey, privateKey };
}
