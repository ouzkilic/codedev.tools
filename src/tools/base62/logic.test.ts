import { describe, it, expect } from 'vitest';
import { base62Logic } from './logic';

const enc = (s: string) => base62Logic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => base62Logic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('base62', () => {
  it('only uses alphanumeric characters', () => {
    expect(enc('Hello World')).toMatch(/^[0-9A-Za-z]+$/);
  });
  it('round-trips text', () => {
    expect(dec(enc('codedev.tools'))).toBe('codedev.tools');
  });
  it('round-trips UTF-8', () => {
    expect(dec(enc('café ☕'))).toBe('café ☕');
  });
  it('throws on invalid characters', () => {
    expect(() => dec('hello-world')).toThrow();
  });
});
