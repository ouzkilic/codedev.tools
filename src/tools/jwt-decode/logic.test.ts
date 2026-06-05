import { describe, it, expect } from 'vitest';
import { jwtDecodeLogic } from './logic';

// Standard jwt.io sample token (HS256).
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('jwtDecode', () => {
  it('decodes the header', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(TOKEN));
    expect(out.header).toEqual({ alg: 'HS256', typ: 'JWT' });
  });
  it('decodes the payload', () => {
    const out = JSON.parse(jwtDecodeLogic.transform(TOKEN));
    expect(out.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
  });
  it('throws when the token has too few segments', () => {
    expect(() => jwtDecodeLogic.transform('not-a-jwt')).toThrow();
  });
});
