import { describe, it, expect } from 'vitest';
import { jwtDecodeLogic } from './logic';

// Standard jwt.io sample token (HS256).
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Reusable base64url-encoded segments (computed deterministically).
const HEADER_HS256 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // {"alg":"HS256","typ":"JWT"}
const EMPTY_OBJ = 'e30'; // {}
const PAYLOAD_NUMS = 'eyJuIjotNSwiemVybyI6MCwiYmlnIjo5OTk5OTk5OTk5fQ'; // {"n":-5,"zero":0,"big":9999999999}
const PAYLOAD_UNICODE = 'eyJuYW1lIjoiSm9zw6kg8J-YgCIsImNpdHkiOiLEsHN0YW5idWwifQ'; // {"name":"José 😀","city":"İstanbul"}
const PAYLOAD_NESTED = 'eyJyb2xlcyI6WyJhIiwiYiJdLCJuZXN0ZWQiOnsieCI6MX19'; // {"roles":["a","b"],"nested":{"x":1}}
const PAYLOAD_SPECIAL = 'eyJrXCJleSI6InZhXFxsdWVcbmxpbmUifQ'; // {"k\"ey":"va\\lue\nline"}
const NOT_JSON_B64 = 'bm90IGpzb24gYXQgYWxs'; // decodes to raw text "not json at all"
const RAW_HELLO = 'aGVsbG8'; // decodes to raw text "hello" (not valid JSON)

describe('jwtDecode', () => {
  // --- happy paths ---
  it('decodes the header', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(TOKEN));
    expect(out.header).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('decodes the payload', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(TOKEN));
    expect(out.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
  });

  it('returns an object with exactly header and payload keys', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(TOKEN));
    expect(Object.keys(out).sort()).toEqual(['header', 'payload']);
  });

  it('produces pretty-printed JSON (2-space indent)', () => {
    const raw = jwtDecodeLogic.transform(TOKEN);
    expect(raw).toContain('\n');
    expect(raw).toMatch(/\n {2}"header":/);
  });

  it('ignores the signature segment entirely (any signature decodes the same)', () => {
    const tampered =
      `${HEADER_HS256}.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.totally-bogus-signature`;
    const a = jwtDecodeLogic.transform(TOKEN);
    const b = jwtDecodeLogic.transform(tampered);
    expect(a).toEqual(b);
  });

  // --- segment count branch ---
  it('decodes a 2-segment token (no signature present)', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(`${HEADER_HS256}.${EMPTY_OBJ}`));
    expect(out.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(out.payload).toEqual({});
  });

  it('decodes a 4-segment token using only the first two segments', () => {
    const out = JSON.parse(
      jwtDecodeLogic.transform(`${HEADER_HS256}.${EMPTY_OBJ}.sig.extra`),
    );
    expect(out.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(out.payload).toEqual({});
  });

  // --- payload content edge cases ---
  it('decodes an empty-object header and payload', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(`${EMPTY_OBJ}.${EMPTY_OBJ}.x`));
    expect(out.header).toEqual({});
    expect(out.payload).toEqual({});
  });

  it('preserves negative, zero, and large integer numeric claims', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(`${HEADER_HS256}.${PAYLOAD_NUMS}`));
    expect(out.payload).toEqual({ n: -5, zero: 0, big: 9999999999 });
  });

  it('decodes unicode and emoji claims correctly (multi-byte UTF-8)', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(`${HEADER_HS256}.${PAYLOAD_UNICODE}`));
    expect(out.payload).toEqual({ name: 'José 😀', city: 'İstanbul' });
  });

  it('decodes nested objects and arrays in the payload', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(`${HEADER_HS256}.${PAYLOAD_NESTED}`));
    expect(out.payload).toEqual({ roles: ['a', 'b'], nested: { x: 1 } });
  });

  it('preserves special characters (quotes, backslashes, newlines) in claims', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(`${HEADER_HS256}.${PAYLOAD_SPECIAL}`));
    expect(out.payload).toEqual({ 'k"ey': 'va\\lue\nline' });
  });

  // --- whitespace handling ---
  it('trims surrounding whitespace before decoding', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(`   ${TOKEN}   `));
    expect(out.header).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('trims surrounding newlines and tabs', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(`\n\t${TOKEN}\n`));
    expect(out.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
  });

  // --- determinism ---
  it('is deterministic across repeated calls', () => {
    expect(jwtDecodeLogic.transform(TOKEN)).toEqual(jwtDecodeLogic.transform(TOKEN));
  });

  // --- large input ---
  it('handles a large payload without crashing', () => {
    const bigObj = { data: 'x'.repeat(5000), arr: Array.from({ length: 200 }, (_, i) => i) };
    const seg = Buffer.from(JSON.stringify(bigObj), 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const out = JSON.parse(jwtDecodeLogic.transform(`${HEADER_HS256}.${seg}`));
    expect(out.payload.data).toHaveLength(5000);
    expect(out.payload.arr).toHaveLength(200);
  });

  // --- error paths ---
  it('throws when the token has too few segments', () => {
    expect(() => jwtDecodeLogic.transform('not-a-jwt')).toThrow();
  });

  it('throws on an empty string', () => {
    expect(() => jwtDecodeLogic.transform('')).toThrow(/valid JWT/);
  });

  it('throws on a whitespace-only string', () => {
    expect(() => jwtDecodeLogic.transform('    \n\t ')).toThrow(/valid JWT/);
  });

  it('throws the expected message for a single segment', () => {
    expect(() => jwtDecodeLogic.transform('justonesegment')).toThrow(
      'Not a valid JWT (expected header.payload.signature).',
    );
  });

  it('throws when a segment decodes to non-JSON text', () => {
    expect(() => jwtDecodeLogic.transform(`${RAW_HELLO}.${EMPTY_OBJ}`)).toThrow();
  });

  it('throws when the payload segment is not valid JSON', () => {
    expect(() => jwtDecodeLogic.transform(`${HEADER_HS256}.${NOT_JSON_B64}`)).toThrow();
  });

  it('throws when a segment is empty (between leading separators)', () => {
    // ".payload" -> parts = ["", "<payload>"]; first segment decodes to "" -> JSON.parse("") throws
    expect(() => jwtDecodeLogic.transform(`.${EMPTY_OBJ}`)).toThrow();
  });

  it('throws when a trailing-separator leaves empty header/payload', () => {
    // "header." has only ["header",""]; "" decodes to "" -> JSON.parse fails on payload
    expect(() => jwtDecodeLogic.transform(`${HEADER_HS256}.`)).toThrow();
  });
});
