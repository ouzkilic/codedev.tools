import { describe, it, expect } from 'vitest';
import { rot13Logic } from './logic';

const run = (input: string, shift: string) =>
  rot13Logic.transform(input, { options: { shift }, secondary: '' });

describe('rot13Logic', () => {
  it('applies ROT13 by default shift', () => {
    expect(run('Hello, World!', '13')).toBe('Uryyb, Jbeyq!');
  });

  it('shifts by 1', () => {
    expect(run('abc', '1')).toBe('bcd');
  });

  it('is its own inverse for shift 13 applied twice', () => {
    const once = run('The quick brown fox', '13');
    expect(run(once, '13')).toBe('The quick brown fox');
  });

  it('leaves digits and punctuation unchanged', () => {
    expect(run('123 !?@#', '5')).toBe('123 !?@#');
  });

  it('falls back to 13 on invalid shift', () => {
    expect(run('abc', 'xyz')).toBe('nop');
  });
});
