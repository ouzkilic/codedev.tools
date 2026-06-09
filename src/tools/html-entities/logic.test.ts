import { describe, it, expect } from 'vitest';
import { htmlEntitiesLogic } from './logic';

const enc = (s: string) => htmlEntitiesLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => htmlEntitiesLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('htmlEntities — encode', () => {
  it('escapes the five special characters', () => {
    expect(enc('<div class="x">a & b</div>')).toBe('&lt;div class=&quot;x&quot;&gt;a &amp; b&lt;/div&gt;');
  });

  it('escapes the single quote as &#39;', () => {
    expect(enc("it's")).toBe('it&#39;s');
  });

  it('escapes each special char individually', () => {
    expect(enc('&')).toBe('&amp;');
    expect(enc('<')).toBe('&lt;');
    expect(enc('>')).toBe('&gt;');
    expect(enc('"')).toBe('&quot;');
    expect(enc("'")).toBe('&#39;');
  });

  it('escapes ampersand so existing entities get double-escaped', () => {
    expect(enc('&amp;')).toBe('&amp;amp;');
  });

  it('leaves non-special characters untouched', () => {
    expect(enc('hello world 123 ğüş')).toBe('hello world 123 ğüş');
  });

  it('returns empty string for empty input', () => {
    expect(enc('')).toBe('');
  });

  it('preserves whitespace-only input', () => {
    expect(enc('   \n\t ')).toBe('   \n\t ');
  });

  it('does not escape emoji or unicode', () => {
    expect(enc('\u{1F600} héllo')).toBe('\u{1F600} héllo');
  });

  it('escapes multiple occurrences of the same char', () => {
    expect(enc('<<<')).toBe('&lt;&lt;&lt;');
  });

  it('handles large input deterministically', () => {
    const raw = '<a>&"\'</a>'.repeat(1000);
    expect(enc(raw)).toBe('&lt;a&gt;&amp;&quot;&#39;&lt;/a&gt;'.repeat(1000));
  });

  it('defaults to encode when no ctx is provided', () => {
    expect(htmlEntitiesLogic.transform('<a>')).toBe('&lt;a&gt;');
  });

  it('defaults to encode when mode is missing from options', () => {
    expect(htmlEntitiesLogic.transform('<a>', { options: {}, secondary: '' })).toBe('&lt;a&gt;');
  });
});

describe('htmlEntities — decode', () => {
  it('unescapes named entities', () => {
    expect(dec('&lt;a&gt; &amp; &quot;b&quot;')).toBe('<a> & "b"');
  });

  it('unescapes apos to a single quote', () => {
    expect(dec('&apos;x&apos;')).toBe("'x'");
  });

  it('unescapes nbsp to a non-breaking space (U+00A0)', () => {
    expect(dec('a&nbsp;b')).toBe('a\u00a0b');
  });

  it('unescapes decimal and hex numeric entities', () => {
    expect(dec('&#65;&#x42;')).toBe('AB');
  });

  it('does not decode uppercase X hex entities (regex only admits lowercase x)', () => {
    expect(dec('&#X41;')).toBe('&#X41;');
  });

  it('unescapes a numeric entity outside the BMP (emoji)', () => {
    expect(dec('&#128512;')).toBe('\u{1F600}');
    expect(dec('&#x1F600;')).toBe('\u{1F600}');
  });

  it('leaves unknown named entities unchanged', () => {
    expect(dec('&copy; &unknownentity;')).toBe('&copy; &unknownentity;');
  });

  it('leaves text without entities unchanged', () => {
    expect(dec('plain text no entities')).toBe('plain text no entities');
  });

  it('returns empty string for empty input', () => {
    expect(dec('')).toBe('');
  });

  it('leaves a lone ampersand untouched (no valid entity)', () => {
    expect(dec('a & b')).toBe('a & b');
  });

  it('leaves a malformed entity without semicolon untouched', () => {
    expect(dec('&amp and &lt')).toBe('&amp and &lt');
  });

  it('decodes the boundary code point 0 (null char) via decimal', () => {
    expect(dec('&#0;')).toBe('\u0000');
  });

  it('is case-sensitive for named entities (AMP is not decoded)', () => {
    expect(dec('&AMP;')).toBe('&AMP;');
  });

  it('decodes consecutive named and numeric entities together', () => {
    expect(dec('&lt;&#65;&gt;')).toBe('<A>');
  });
});

describe('htmlEntities — round-trip & properties', () => {
  it('round-trips escape -> unescape', () => {
    const raw = '<p title="x & y">\'quote\'</p>';
    expect(dec(enc(raw))).toBe(raw);
  });

  it('round-trips a string of all five special chars', () => {
    const raw = '&<>"\'';
    expect(dec(enc(raw))).toBe(raw);
  });

  it('double-encode is reversible by double-decode', () => {
    const raw = '<a & b>';
    expect(dec(dec(enc(enc(raw))))).toBe(raw);
  });

  it('round-trips plain text with no special chars', () => {
    const raw = 'no entities here';
    expect(dec(enc(raw))).toBe(raw);
  });
});
