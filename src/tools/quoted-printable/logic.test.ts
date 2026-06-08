import { describe, it, expect } from 'vitest';
import { quotedPrintableLogic } from './logic';

const enc = (s: string) => quotedPrintableLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => quotedPrintableLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('quotedPrintable', () => {
  it('encodes non-ASCII bytes as =XX', () => {
    expect(enc('café')).toBe('caf=C3=A9');
  });
  it('encodes the equals sign', () => {
    expect(enc('a=b')).toBe('a=3Db');
  });
  it('decodes back to the original', () => {
    expect(dec('caf=C3=A9')).toBe('café');
  });
  it('round-trips', () => {
    expect(dec(enc('Über=cool ☕'))).toBe('Über=cool ☕');
  });
});
