import { describe, it, expect } from 'vitest';
import { keycodeLogic } from './logic';

describe('keycodeLogic.transform', () => {
  // --- Existing assertions (kept) ---
  it('maps Enter to keyCode 13', () => {
    expect(keycodeLogic.transform('Enter')).toContain('keyCode: 13');
  });
  it('maps a to keyCode 65', () => {
    expect(keycodeLogic.transform('a')).toContain('keyCode: 65');
  });
  it('maps Space to keyCode 32', () => {
    expect(keycodeLogic.transform('Space')).toContain('keyCode: 32');
  });
  it('maps 5 to keyCode 53', () => {
    expect(keycodeLogic.transform('5')).toContain('keyCode: 53');
  });

  // --- Empty / whitespace handling ---
  it('returns empty string for empty input', () => {
    expect(keycodeLogic.transform('')).toBe('');
  });
  it('returns empty string for whitespace-only input', () => {
    expect(keycodeLogic.transform('   ')).toBe('');
    expect(keycodeLogic.transform('\t\n ')).toBe('');
  });

  // --- Exact output format ---
  it('produces the full "Key:/keyCode:" two-line format', () => {
    expect(keycodeLogic.transform('Enter')).toBe('Key: Enter\nkeyCode: 13');
  });
  it('preserves the original-cased key in the Key: line for single chars', () => {
    expect(keycodeLogic.transform('a')).toBe('Key: a\nkeyCode: 65');
  });

  // --- Named keys (case-insensitive lookup) ---
  it('maps Tab to 9', () => {
    expect(keycodeLogic.transform('Tab')).toBe('Key: Tab\nkeyCode: 9');
  });
  it('maps Escape to 27', () => {
    expect(keycodeLogic.transform('Escape')).toContain('keyCode: 27');
  });
  it('maps esc alias to 27', () => {
    expect(keycodeLogic.transform('esc')).toBe('Key: esc\nkeyCode: 27');
  });
  it('maps Backspace to 8 and Delete to 46', () => {
    expect(keycodeLogic.transform('Backspace')).toContain('keyCode: 8');
    expect(keycodeLogic.transform('Delete')).toContain('keyCode: 46');
  });
  it('maps arrow keys correctly', () => {
    expect(keycodeLogic.transform('ArrowUp')).toContain('keyCode: 38');
    expect(keycodeLogic.transform('ArrowDown')).toContain('keyCode: 40');
    expect(keycodeLogic.transform('ArrowLeft')).toContain('keyCode: 37');
    expect(keycodeLogic.transform('ArrowRight')).toContain('keyCode: 39');
  });
  it('maps modifier keys and aliases', () => {
    expect(keycodeLogic.transform('Shift')).toContain('keyCode: 16');
    expect(keycodeLogic.transform('Control')).toContain('keyCode: 17');
    expect(keycodeLogic.transform('Ctrl')).toContain('keyCode: 17');
    expect(keycodeLogic.transform('Alt')).toContain('keyCode: 18');
    expect(keycodeLogic.transform('CapsLock')).toContain('keyCode: 20');
  });
  it('maps Home to 36 and End to 35', () => {
    expect(keycodeLogic.transform('Home')).toContain('keyCode: 36');
    expect(keycodeLogic.transform('End')).toContain('keyCode: 35');
  });

  // --- Case-insensitivity of named lookup, original case preserved in output ---
  it('looks up named keys case-insensitively but echoes original case', () => {
    expect(keycodeLogic.transform('ENTER')).toBe('Key: ENTER\nkeyCode: 13');
    expect(keycodeLogic.transform('eNtEr')).toBe('Key: eNtEr\nkeyCode: 13');
  });

  // --- Trimming ---
  it('trims surrounding whitespace before processing named keys', () => {
    expect(keycodeLogic.transform('  Enter  ')).toBe('Key: Enter\nkeyCode: 13');
  });
  it('trims surrounding whitespace before processing single chars', () => {
    expect(keycodeLogic.transform('  a  ')).toBe('Key: a\nkeyCode: 65');
  });

  // --- Single-character path ---
  it('uppercases single letters before charCodeAt', () => {
    expect(keycodeLogic.transform('a')).toBe('Key: a\nkeyCode: 65');
    expect(keycodeLogic.transform('A')).toBe('Key: A\nkeyCode: 65');
    expect(keycodeLogic.transform('z')).toContain('keyCode: 90');
    expect(keycodeLogic.transform('Z')).toContain('keyCode: 90');
  });
  it('maps digit characters by their char code (0=48..9=57)', () => {
    expect(keycodeLogic.transform('0')).toContain('keyCode: 48');
    expect(keycodeLogic.transform('9')).toContain('keyCode: 57');
  });
  it('maps punctuation single chars by char code', () => {
    // '-' -> 45, '+' -> 43
    expect(keycodeLogic.transform('-')).toContain('keyCode: 45');
    expect(keycodeLogic.transform('+')).toContain('keyCode: 43');
  });
  it('handles a single accented unicode char (length 1)', () => {
    // 'é'.toUpperCase() === 'É' -> charCode 201
    expect(keycodeLogic.transform('é')).toContain('keyCode: 201');
  });

  // --- Error paths ---
  it('throws on an unknown multi-character key', () => {
    expect(() => keycodeLogic.transform('foo')).toThrow('Unknown key: foo');
  });
  it('throws on a two-letter unknown token', () => {
    expect(() => keycodeLogic.transform('ab')).toThrow(/Unknown key/);
  });
  it('throws on an emoji (surrogate pair, length 2)', () => {
    // '😀'.length === 2 in JS, not in NAMED -> throws
    expect(() => keycodeLogic.transform('😀')).toThrow(/Unknown key/);
  });
  it('error message includes the trimmed original key', () => {
    expect(() => keycodeLogic.transform('  unknownKey  ')).toThrow('Unknown key: unknownKey');
  });

  // --- Determinism / idempotency ---
  it('is deterministic across repeated calls', () => {
    const a = keycodeLogic.transform('Enter');
    const b = keycodeLogic.transform('Enter');
    expect(a).toBe(b);
  });
});
