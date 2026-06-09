import { describe, it, expect } from 'vitest';
import { htmlToJsxLogic } from './logic';

const t = (input: string): string => htmlToJsxLogic.transform(input);

describe('htmlToJsxLogic', () => {
  // --- existing assertions (kept) ---
  it('converts class to className', () => {
    expect(t('<div class="x">')).toBe('<div className="x">');
  });

  it('converts for to htmlFor', () => {
    expect(t('<label for="y">z</label>')).toBe('<label htmlFor="y">z</label>');
  });

  it('self-closes void elements', () => {
    expect(t('<br>')).toBe('<br />');
  });

  it('converts HTML comments to JSX comments', () => {
    expect(t('<!-- c -->')).toBe('{/* c */}');
  });

  it('does not double self-close already closed void elements', () => {
    expect(t('<br />')).toBe('<br />');
  });

  // --- class -> className ---
  it('converts every class= occurrence (global)', () => {
    expect(t('<div class="a" class="b">')).toBe(
      '<div className="a" className="b">',
    );
  });

  it('does not touch class substrings without a word boundary', () => {
    expect(t('myclass="x"')).toBe('myclass="x"');
  });

  it('preserves the class attribute value verbatim', () => {
    expect(t('<span class="a b c">')).toBe('<span className="a b c">');
  });

  // --- for -> htmlFor ---
  it('converts for= preceded by a word boundary', () => {
    expect(t('<label for="email">')).toBe('<label htmlFor="email">');
  });

  it('does not convert for substrings without a word boundary', () => {
    expect(t('<div data-before="1">')).toBe('<div data-before="1">');
  });

  it('handles both class and for in the same tag', () => {
    expect(t('<p class="c" for="f">')).toBe('<p className="c" htmlFor="f">');
  });

  // --- comments ---
  it('preserves comment content including surrounding spaces', () => {
    expect(t('<!-- hello world -->')).toBe('{/* hello world */}');
  });

  it('converts multiple comments independently', () => {
    expect(t('<!-- a --><!-- b -->')).toBe('{/* a */}{/* b */}');
  });

  it('converts multiline comments and keeps newlines', () => {
    expect(t('<!--\nmulti\nline\n-->')).toBe('{/*\nmulti\nline\n*/}');
  });

  it('handles an empty comment', () => {
    expect(t('<!---->')).toBe('{/**/}');
  });

  // --- void elements ---
  it('self-closes a void element with attributes', () => {
    expect(t('<img src="x.png">')).toBe('<img src="x.png" />');
  });

  it('self-closes a void element with a boolean attribute', () => {
    expect(t('<input disabled>')).toBe('<input disabled />');
  });

  it('is case-insensitive for void element names', () => {
    expect(t('<BR>')).toBe('<BR />');
    expect(t('<Img src="a">')).toBe('<Img src="a" />');
  });

  it('self-closes multiple void elements in sequence', () => {
    expect(t('<br><br>')).toBe('<br /><br />');
  });

  it('self-closes various void element kinds', () => {
    expect(t('<hr>')).toBe('<hr />');
    expect(t('<wbr>')).toBe('<wbr />');
    expect(t('<col span="2">')).toBe('<col span="2" />');
    expect(t('<meta charset="utf-8">')).toBe('<meta charset="utf-8" />');
    expect(t('<link rel="x">')).toBe('<link rel="x" />');
  });

  it('does not add a space when already self-closed with a slash and space', () => {
    expect(t('<input type="text" />')).toBe('<input type="text" />');
  });

  it('leaves slash-closed void elements without a space untouched', () => {
    // char before '>' is '/', so (?<!/) prevents a match
    expect(t('<br/>')).toBe('<br/>');
  });

  it('does not self-close non-void elements', () => {
    expect(t('<div>no void</div>')).toBe('<div>no void</div>');
    expect(t('<for>')).toBe('<for>');
  });

  // --- combinations ---
  it('applies class conversion and void self-closing together', () => {
    expect(t('<img class="hero" src="a.png">')).toBe(
      '<img className="hero" src="a.png" />',
    );
  });

  it('processes a realistic snippet end-to-end', () => {
    const input =
      '<!-- header --><label for="n" class="lbl">Name</label><input class="in">';
    expect(t(input)).toBe(
      '{/* header */}<label htmlFor="n" className="lbl">Name</label><input className="in" />',
    );
  });

  // --- edge cases ---
  it('returns empty string unchanged', () => {
    expect(t('')).toBe('');
  });

  it('returns whitespace-only input unchanged', () => {
    expect(t('   \n\t ')).toBe('   \n\t ');
  });

  it('returns plain text (with unicode/emoji) unchanged', () => {
    expect(t('plain text 🚀 ünïcödé')).toBe('plain text 🚀 ünïcödé');
  });

  it('handles a large repeated input deterministically', () => {
    const unit = '<br><div class="x">';
    const input = unit.repeat(500);
    const expected = '<br /><div className="x">'.repeat(500);
    expect(t(input)).toBe(expected);
  });

  // --- determinism / idempotency ---
  it('is deterministic across repeated calls', () => {
    const input = '<img class="a" src="b">';
    expect(t(input)).toBe(t(input));
  });

  it('is idempotent: applying the transform to its own output yields the same result', () => {
    const input = '<label for="x" class="y"><br></label>';
    const once = t(input);
    expect(t(once)).toBe(once);
  });

  it('never throws on arbitrary/malformed input', () => {
    expect(() => t('<<<>>> <br <div class= <!-- unterminated')).not.toThrow();
    expect(() => t('<img src=">"')).not.toThrow();
  });
});
