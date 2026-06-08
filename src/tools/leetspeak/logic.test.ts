import { describe, it, expect } from 'vitest';
import { leetspeakLogic } from './logic';

const encode = (input: string) =>
  leetspeakLogic.transform(input, { options: { mode: 'encode' }, secondary: '' });
const decode = (input: string) =>
  leetspeakLogic.transform(input, { options: { mode: 'decode' }, secondary: '' });

describe('leetspeakLogic', () => {
  it('encodes leet to l337', () => {
    expect(encode('leet')).toBe('l337');
  });

  it('encodes test to 7357', () => {
    expect(encode('test')).toBe('7357');
  });

  it('encodes Hello preserving unmapped case', () => {
    expect(encode('Hello')).toBe('H3ll0');
  });

  it('decodes l337 back to leet', () => {
    expect(decode('l337')).toBe('leet');
  });

  it('defaults to encode when no options provided', () => {
    expect(leetspeakLogic.transform('test')).toBe('7357');
  });

  it('leaves unmapped characters unchanged on empty input', () => {
    expect(encode('')).toBe('');
  });
});
