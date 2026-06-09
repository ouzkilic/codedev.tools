import { describe, it, expect } from 'vitest';
import { rot13Logic } from './logic';

const run = (input: string, shift: string) =>
  rot13Logic.transform(input, { options: { shift }, secondary: '' });

describe('rot13Logic', () => {
  it('applies ROT13 by default shift', () => {
    expect(run('Hello, World!', '13')).toBe('Uryyb, Jbeyq!');
  });

  it('shifts lowercase by 1', () => {
    expect(run('abc', '1')).toBe('bcd');
  });

  it('shifts uppercase by 1', () => {
    expect(run('ABC', '1')).toBe('BCD');
  });

  it('is its own inverse for shift 13 applied twice', () => {
    const once = run('The quick brown fox', '13');
    expect(run(once, '13')).toBe('The quick brown fox');
  });

  it('leaves digits and punctuation unchanged', () => {
    expect(run('123 !?@#', '5')).toBe('123 !?@#');
  });

  it('falls back to 13 on non-numeric shift', () => {
    expect(run('abc', 'xyz')).toBe('nop');
  });

  it('treats shift "0" as 13 because of the || 13 falsy fallback', () => {
    // parseInt('0') -> 0 which is falsy, so it becomes 13 (NOT identity)
    expect(run('abc', '0')).toBe('nop');
  });

  it('uses the default shift of 13 when ctx is omitted', () => {
    expect(rot13Logic.transform('Hello')).toBe('Uryyb');
  });

  it('uses the default shift of 13 when shift option is undefined', () => {
    expect(rot13Logic.transform('Hello', { options: {}, secondary: '' })).toBe('Uryyb');
  });

  it('wraps lowercase z correctly at shift boundary', () => {
    expect(run('z', '1')).toBe('a');
  });

  it('wraps uppercase Z correctly at shift boundary', () => {
    expect(run('Z', '1')).toBe('A');
  });

  it('wraps mixed-case at boundary preserving case', () => {
    expect(run('Zz', '1')).toBe('Aa');
  });

  it('shift 25 behaves like shifting back by 1', () => {
    expect(run('Aa', '25')).toBe('Zz');
  });

  it('shift 26 is the identity (n becomes 0)', () => {
    expect(run('Hello, World!', '26')).toBe('Hello, World!');
  });

  it('shift 52 is the identity (full double cycle)', () => {
    expect(run('Hello, World!', '52')).toBe('Hello, World!');
  });

  it('shift 27 equals shift 1 (modulo 26)', () => {
    expect(run('xyz', '27')).toBe(run('xyz', '1'));
    expect(run('xyz', '27')).toBe('yza');
  });

  it('negative shift -13 normalizes to 13', () => {
    expect(run('abc', '-13')).toBe('nop');
  });

  it('negative shift -1 normalizes to 25 (shift back by one)', () => {
    expect(run('abc', '-1')).toBe('zab');
  });

  it('parses leading integer of a float shift (1.5 -> 1)', () => {
    expect(run('abc', '1.5')).toBe('bcd');
  });

  it('parses leading digits of an alphanumeric shift (5abc -> 5)', () => {
    expect(run('abc', '5abc')).toBe('fgh');
  });

  it('parses shift with surrounding whitespace', () => {
    expect(run('abc', '  5  ')).toBe('fgh');
  });

  it('returns empty string for empty input', () => {
    expect(run('', '13')).toBe('');
  });

  it('leaves whitespace-only input unchanged', () => {
    expect(run('   \t\n  ', '13')).toBe('   \t\n  ');
  });

  it('preserves non-ASCII letters and only rotates a-zA-Z', () => {
    // é is outside [a-zA-Z] so it stays; c,a,f rotate by 1
    expect(run('café', '1')).toBe('dbgé');
  });

  it('preserves emoji and surrogate pairs while rotating letters', () => {
    expect(run('a😀b', '1')).toBe('b😀c');
  });

  it('round-trips encode then decode with complementary shifts (5 + 21)', () => {
    const encoded = run('Hello, World!', '5');
    expect(run(encoded, '21')).toBe('Hello, World!');
  });

  it('round-trips an arbitrary shift back to original (7 then 19)', () => {
    const original = 'The Quick Brown Fox Jumps Over 13 Lazy Dogs.';
    expect(run(run(original, '7'), '19')).toBe(original);
  });

  it('is deterministic for repeated calls with the same input/shift', () => {
    expect(run('Determinism', '9')).toBe(run('Determinism', '9'));
  });

  it('handles a very large input correctly and only rotates letters', () => {
    const big = 'aA'.repeat(10000);
    const out = run(big, '13');
    expect(out).toBe('nN'.repeat(10000));
    expect(out.length).toBe(big.length);
  });

  it('preserves the full alphabet mapping for ROT13 lowercase', () => {
    expect(run('abcdefghijklmnopqrstuvwxyz', '13')).toBe(
      'nopqrstuvwxyzabcdefghijklm',
    );
  });

  it('preserves the full alphabet mapping for ROT13 uppercase', () => {
    expect(run('ABCDEFGHIJKLMNOPQRSTUVWXYZ', '13')).toBe(
      'NOPQRSTUVWXYZABCDEFGHIJKLM',
    );
  });

  it('does not cross-contaminate case (lowercase stays lowercase, uppercase stays uppercase)', () => {
    const out = run('aZ', '1');
    expect(out).toBe('bA');
  });

  it('exposes a single text option named "shift" with default 13', () => {
    expect(rot13Logic.options).toEqual([
      { key: 'shift', label: 'Shift', type: 'text', placeholder: '13', default: '13' },
    ]);
  });
});
