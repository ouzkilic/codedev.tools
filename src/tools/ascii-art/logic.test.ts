import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { asciiArtLogic } from './logic';

// The transform ignores ctx entirely; it always renders with the Standard
// figlet font and falls back to the literal "text" when input is falsy.
const ctx: ToolContext = { options: {}, secondary: '' };

const render = (input: string) => asciiArtLogic.transform(input, ctx);

describe('asciiArtLogic', () => {
  it('renders text as a multi-line ASCII banner', async () => {
    const out = await render('Hi');
    expect(out).toContain('\n');
    expect(out.length).toBeGreaterThan(5);
  });

  it('renders a single letter across the Standard font height (6 rows)', async () => {
    const out = await render('A');
    expect(out.split('\n')).toHaveLength(6);
  });

  it('produces the exact Standard glyph for "A"', async () => {
    const out = await render('A');
    expect(out).toBe(
      [
        '     _    ',
        '    / \\   ',
        '   / _ \\  ',
        '  / ___ \\ ',
        ' /_/   \\_\\',
        '          ',
      ].join('\n'),
    );
  });

  it('renders the first glyph row of "Hi" exactly', async () => {
    const out = await render('Hi');
    expect(out.split('\n')[0]).toBe('  _   _ _ ');
  });

  it('falls back to the literal word "text" for an empty string', async () => {
    const out = await render('');
    const expected = await render('text');
    expect(out).toBe(expected);
    // sanity: the fallback actually rendered the letters t-e-x-t
    expect(out).not.toBe('');
    expect(out.split('\n')).toHaveLength(6);
  });

  it('does NOT fall back for a single space (space is truthy)', async () => {
    const out = await render(' ');
    const fallback = await render('text');
    expect(out).not.toBe(fallback);
    // a single space renders six rows of two spaces each
    expect(out.split('\n')).toHaveLength(6);
    expect(out.replace(/\s/g, '')).toBe('');
  });

  it('renders only blank rows for whitespace-only input', async () => {
    const out = await render('   ');
    expect(out.trim()).toBe('');
    expect(out.split('\n')).toHaveLength(6);
  });

  it('renders digits (boundary 0 and 9)', async () => {
    const zero = await render('0');
    const nine = await render('9');
    expect(zero.split('\n')).toHaveLength(6);
    expect(nine.split('\n')).toHaveLength(6);
    expect(zero).not.toBe(nine);
  });

  it('renders the digit "1" with the expected narrow glyph', async () => {
    const out = await render('1');
    expect(out).toBe(['  _ ', ' / |', ' | |', ' | |', ' |_|', '    '].join('\n'));
  });

  it('renders special characters such as @ and #', async () => {
    const out = await render('@#');
    expect(out.split('\n')).toHaveLength(6);
    expect(out.length).toBeGreaterThan(0);
  });

  it('handles common punctuation without throwing', async () => {
    const out = await render('a!?.,');
    expect(out.split('\n')).toHaveLength(6);
    expect(out.length).toBeGreaterThan(0);
  });

  it('renders accented unicode (é) using the Standard font', async () => {
    const out = await render('é');
    expect(out.split('\n')).toHaveLength(6);
    expect(out.length).toBeGreaterThan(0);
  });

  it('returns an empty banner for an unsupported emoji glyph', async () => {
    // The Standard font has no glyph for 😀, so figlet yields an empty string.
    const out = await render('😀');
    expect(out).toBe('');
  });

  it('stacks multiple banners when the input contains a newline', async () => {
    const out = await render('a\nb');
    // each source line becomes its own 6-row banner (joined => 10 lines after
    // the shared blank rows collapse at the seam: 6 + 6 - 2 = 10)
    expect(out.split('\n')).toHaveLength(10);
  });

  it('grows wider as more characters are added', async () => {
    const short = await render('Hi');
    const long = await render('Hello World 12345');
    const widthOf = (s: string) =>
      Math.max(...s.split('\n').map((l) => l.length));
    expect(widthOf(long)).toBeGreaterThan(widthOf(short));
    // height stays constant for single-line input
    expect(long.split('\n')).toHaveLength(6);
  });

  it('handles a very large input without crashing', async () => {
    const big = 'A'.repeat(500);
    const out = await render(big);
    expect(out.split('\n')).toHaveLength(6);
    expect(out.length).toBeGreaterThan(500);
  });

  it('is deterministic for repeated calls with the same input', async () => {
    const a = await render('Determinism');
    const b = await render('Determinism');
    expect(a).toBe(b);
  });

  it('is idempotent across many invocations (font parsing is stable)', async () => {
    const first = await render('Stable');
    for (let i = 0; i < 5; i++) {
      expect(await render('Stable')).toBe(first);
    }
  });

  it('produces distinct output for distinct input', async () => {
    const x = await render('foo');
    const y = await render('bar');
    expect(x).not.toBe(y);
  });

  it('is case-sensitive (uppercase vs lowercase differ)', async () => {
    const upper = await render('ABC');
    const lower = await render('abc');
    expect(upper).not.toBe(lower);
  });

  it('ignores the options/secondary context (output depends only on input)', async () => {
    const base = await render('Ctx');
    const withOpts = await asciiArtLogic.transform('Ctx', {
      options: { font: 'Banner', whatever: true },
      secondary: 'ignored secondary value',
    });
    expect(withOpts).toBe(base);
  });

  it('resolves to a string for every invocation', async () => {
    const out = await render('typecheck');
    expect(typeof out).toBe('string');
  });
});
