import { describe, it, expect } from 'vitest';
import { invisibleCharsLogic } from './logic';

const transform = (s: string) => invisibleCharsLogic.transform(s);

// The eight invisible code points the tool strips.
const ZWSP = '​'; // zero-width space
const ZWNJ = '‌'; // zero-width non-joiner
const ZWJ = '‍'; // zero-width joiner
const LRM = '‎'; // left-to-right mark
const RLM = '‏'; // right-to-left mark
const BOM = '﻿'; // BOM / zero-width no-break space
const SHY = '­'; // soft hyphen
const WJ = '⁠'; // word joiner

const ALL_INVISIBLE = [ZWSP, ZWNJ, ZWJ, LRM, RLM, BOM, SHY, WJ];

describe('invisibleCharsLogic', () => {
  // --- existing assertions preserved (rewritten with explicit escapes) ---
  it('removes a zero-width space', () => {
    expect(transform(`a${ZWSP}b`)).toBe('ab');
  });

  it('removes a BOM/zero-width no-break space', () => {
    expect(transform(`x${BOM}y`)).toBe('xy');
  });

  it('leaves plain text unchanged', () => {
    expect(transform('hello')).toBe('hello');
  });

  it('reduces a string of only zero-width chars to empty', () => {
    expect(transform(`${ZWSP}${ZWNJ}${ZWJ}${WJ}`)).toBe('');
  });

  it('removes a soft hyphen', () => {
    expect(transform(`co${SHY}op`)).toBe('coop');
  });

  // --- each individual invisible character is stripped ---
  it.each([
    ['ZWSP', ZWSP],
    ['ZWNJ', ZWNJ],
    ['ZWJ', ZWJ],
    ['LRM', LRM],
    ['RLM', RLM],
    ['BOM', BOM],
    ['SHY', SHY],
    ['WJ', WJ],
  ])('strips %s when surrounded by visible text', (_name, ch) => {
    expect(transform(`a${ch}b`)).toBe('ab');
  });

  it('strips all eight invisible chars from a single string', () => {
    const input = `s${ALL_INVISIBLE.join('')}e`;
    expect(transform(input)).toBe('se');
  });

  // --- edge: empty / whitespace ---
  it('returns empty string unchanged', () => {
    expect(transform('')).toBe('');
  });

  it('preserves real whitespace (space, tab, newline)', () => {
    const input = ' \t\n\r ';
    expect(transform(input)).toBe(input);
  });

  it('does not strip a regular non-breaking space (U+00A0)', () => {
    // U+00A0 is NOT in the strip set; only U+00AD (soft hyphen) is.
    const nbsp = ' ';
    expect(transform(`a${nbsp}b`)).toBe(`a${nbsp}b`);
  });

  // --- positions: leading / trailing / consecutive ---
  it('strips leading invisible chars', () => {
    expect(transform(`${ZWSP}${BOM}text`)).toBe('text');
  });

  it('strips trailing invisible chars', () => {
    expect(transform(`text${WJ}${RLM}`)).toBe('text');
  });

  it('strips runs of consecutive invisible chars between letters', () => {
    expect(transform(`a${ZWSP}${ZWSP}${ZWSP}b`)).toBe('ab');
  });

  it('strips invisible chars interleaved through a word', () => {
    expect(transform(`h${ZWSP}e${ZWNJ}l${ZWJ}l${WJ}o`)).toBe('hello');
  });

  // --- unicode / emoji ---
  it('preserves emoji while stripping a ZWJ between them', () => {
    // Note: removing the ZWJ from a ZWJ-sequence changes rendering,
    // but the code points for the two faces remain intact.
    const input = `\u{1f468}${ZWJ}\u{1f469}`;
    expect(transform(input)).toBe('\u{1f468}\u{1f469}');
  });

  it('preserves non-latin scripts (Arabic) while stripping marks', () => {
    const input = `م${RLM}ر`;
    expect(transform(input)).toBe('مر');
  });

  it('preserves CJK characters', () => {
    const input = '你好';
    expect(transform(input)).toBe(input);
  });

  // --- properties: idempotency & determinism ---
  it('is idempotent (second pass changes nothing)', () => {
    const input = `a${ZWSP}b${SHY}c${BOM}`;
    const once = transform(input);
    expect(transform(once)).toBe(once);
  });

  it('is deterministic (same input -> same output)', () => {
    const input = `x${LRM}y${ZWJ}z`;
    expect(transform(input)).toBe(transform(input));
  });

  it('output contains none of the stripped code points', () => {
    const input = `lorem${ALL_INVISIBLE.join('ipsum')}dolor`;
    const out = transform(input);
    for (const ch of ALL_INVISIBLE) {
      expect(out.includes(ch)).toBe(false);
    }
  });

  // --- large input ---
  it('handles a large input efficiently and strips every invisible char', () => {
    const unit = `word${ZWSP}`;
    const input = unit.repeat(10000);
    const out = transform(input);
    expect(out).toBe('word'.repeat(10000));
    expect(out.includes(ZWSP)).toBe(false);
  });

  // --- multiline ---
  it('strips invisible chars across multiple lines (global flag)', () => {
    const input = `line1${ZWSP}\nline2${BOM}\nline3${WJ}`;
    expect(transform(input)).toBe('line1\nline2\nline3');
  });
});
