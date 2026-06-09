import { describe, it, expect } from 'vitest';
import { whitespaceLogic } from './logic';

const run = (s: string, options: Record<string, boolean>) =>
  whitespaceLogic.transform(s, { options, secondary: '' });

describe('whitespace', () => {
  // --- option definitions ---
  it('exposes three toggle options with expected defaults', () => {
    expect(whitespaceLogic.options).toEqual([
      { key: 'trimLines', label: 'Trim lines', type: 'toggle', default: true },
      { key: 'collapse', label: 'Collapse spaces', type: 'toggle', default: false },
      { key: 'removeEmpty', label: 'Remove empty lines', type: 'toggle', default: false },
    ]);
  });

  // --- happy paths per option ---
  it('trims each line', () => {
    expect(run('  a  \n  b ', { trimLines: true })).toBe('a\nb');
  });
  it('collapses repeated spaces', () => {
    expect(run('a    b', { collapse: true })).toBe('a b');
  });
  it('removes empty lines', () => {
    expect(run('a\n\n  \nb', { removeEmpty: true })).toBe('a\nb');
  });
  it('combines options', () => {
    expect(run('  a   b  \n\n c ', { trimLines: true, collapse: true, removeEmpty: true })).toBe('a b\nc');
  });

  // --- no options selected ---
  it('returns input unchanged when no options are enabled', () => {
    const input = '  a  \n\n  b  \t\tc  ';
    expect(run(input, {})).toBe(input);
  });
  it('treats missing ctx as all options off (identity)', () => {
    const input = '  keep   spaces  \n\n';
    expect(whitespaceLogic.transform(input)).toBe(input);
  });

  // --- collapse specifics ---
  it('collapses runs of tabs to a single space', () => {
    expect(run('a\t\t\tb', { collapse: true })).toBe('a b');
  });
  it('collapses mixed tab/space runs of length >= 2', () => {
    expect(run('a \t b', { collapse: true })).toBe('a b');
  });
  it('does not touch a single space when collapsing', () => {
    expect(run('a b c', { collapse: true })).toBe('a b c');
  });
  it('collapse leaves leading/trailing whitespace as a single space (no trim)', () => {
    expect(run('   a   ', { collapse: true })).toBe(' a ');
  });

  // --- trim specifics ---
  it('trim removes leading and trailing tabs', () => {
    expect(run('\t\ta\t\t', { trimLines: true })).toBe('a');
  });
  it('trim does not collapse interior whitespace', () => {
    expect(run('  a    b  ', { trimLines: true })).toBe('a    b');
  });

  // --- removeEmpty specifics ---
  it('removeEmpty drops whitespace-only lines even without trimming', () => {
    expect(run('a\n   \n\t\nb', { removeEmpty: true })).toBe('a\nb');
  });
  it('removeEmpty keeps lines with non-whitespace content', () => {
    expect(run('x\n y \nz', { removeEmpty: true })).toBe('x\n y \nz');
  });

  // --- ordering: collapse runs before trim before removeEmpty ---
  it('applies collapse then trim then removeEmpty in order', () => {
    // "  a   b  " -> collapse -> " a b " -> trim -> "a b"
    // "      " (6 spaces) -> collapse -> " " -> trim -> "" -> removed
    expect(run('  a   b  \n      \nc', { trimLines: true, collapse: true, removeEmpty: true })).toBe('a b\nc');
  });

  // --- edge cases ---
  it('handles empty string input', () => {
    expect(run('', { trimLines: true, collapse: true, removeEmpty: true })).toBe('');
  });
  it('handles a whitespace-only single line', () => {
    expect(run('    ', { trimLines: true })).toBe('');
    expect(run('    ', { removeEmpty: true })).toBe('');
  });
  it('preserves line count when only trimming (no removeEmpty)', () => {
    const out = run('a\n\nb', { trimLines: true });
    expect(out.split('\n')).toHaveLength(3);
    expect(out).toBe('a\n\nb');
  });
  it('does not strip unicode emoji as whitespace', () => {
    expect(run('  🚀 fast  ', { trimLines: true, collapse: true })).toBe('🚀 fast');
  });
  it('preserves unicode content while trimming surrounding spaces', () => {
    expect(run('  café — naïve  ', { trimLines: true })).toBe('café — naïve');
  });
  it('handles large multi-line input deterministically', () => {
    const input = Array.from({ length: 1000 }, (_, i) => `   line ${i}   `).join('\n');
    const out = run(input, { trimLines: true });
    const lines = out.split('\n');
    expect(lines).toHaveLength(1000);
    expect(lines[0]).toBe('line 0');
    expect(lines[999]).toBe('line 999');
  });

  // --- idempotency / properties ---
  it('is idempotent when all options enabled', () => {
    const input = '  a   b  \n\n  c \t d  \n   \n';
    const once = run(input, { trimLines: true, collapse: true, removeEmpty: true });
    const twice = run(once, { trimLines: true, collapse: true, removeEmpty: true });
    expect(twice).toBe(once);
  });
  it('trimming twice equals trimming once (idempotent)', () => {
    const input = '  a  \n  b  ';
    const once = run(input, { trimLines: true });
    expect(run(once, { trimLines: true })).toBe(once);
  });

  // --- falsy / coercion behavior ---
  it('coerces falsy option values to disabled', () => {
    const input = '  a  ';
    expect(run(input, { trimLines: false })).toBe(input);
  });
});
