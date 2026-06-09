import { describe, it, expect } from 'vitest';
import { htmlStripLogic } from './logic';

const strip = (input: string) => htmlStripLogic.transform(input);

describe('htmlStripLogic', () => {
  // --- existing assertions (kept) ---
  it('strips nested tags', () => {
    expect(strip('<p>Hi <b>there</b></p>')).toBe('Hi there');
  });

  it('strips tags with attributes', () => {
    expect(strip('<a href="x">link</a>')).toBe('link');
  });

  it('decodes &amp;', () => {
    expect(strip('a &amp; b')).toBe('a & b');
  });

  it('decodes &lt; and &gt;', () => {
    expect(strip('&lt;tag&gt;')).toBe('<tag>');
  });

  it('decodes nbsp to space and quotes', () => {
    expect(strip('foo&nbsp;&quot;bar&quot;&#39;')).toBe('foo "bar"\'');
  });

  it('collapses excessive blank lines and trims', () => {
    expect(strip('  <div>x</div>\n\n\n\n<div>y</div>  ')).toBe('x\n\ny');
  });

  // --- empty / whitespace edge cases ---
  it('returns empty string for empty input', () => {
    expect(strip('')).toBe('');
  });

  it('returns empty string for whitespace-only input (trimmed)', () => {
    expect(strip('   \n\n   ')).toBe('');
  });

  it('returns empty string when input is only tags', () => {
    expect(strip('<br/><br/>')).toBe('');
  });

  it('strips a self-closing tag entirely', () => {
    expect(strip('before<br/>after')).toBe('beforeafter');
  });

  // --- plain text passthrough ---
  it('leaves plain text without tags or entities unchanged', () => {
    expect(strip('plain text no tags')).toBe('plain text no tags');
  });

  it('preserves unicode and emoji content', () => {
    expect(strip('café ☕ <b>x</b>')).toBe('café ☕ x');
  });

  // --- entity decoding details ---
  it('decodes a sequence of distinct entities', () => {
    expect(strip('3 &lt; 5 &amp;&amp; 5 &gt; 3')).toBe('3 < 5 && 5 > 3');
  });

  it('decodes &amp; last so &amp;lt; becomes &lt;', () => {
    // raw "&amp;lt;" has no literal "&lt;" substring; only "&amp;" matches -> "&lt;"
    expect(strip('&amp;lt;')).toBe('&lt;');
  });

  it('decodes &amp;amp; to &amp;', () => {
    expect(strip('&amp;amp;')).toBe('&amp;');
  });

  it('decodes escaped tag entities into literal angle brackets, not stripped', () => {
    expect(strip('&lt;b&gt;bold&lt;/b&gt;')).toBe('<b>bold</b>');
  });

  it('leaves unknown entities untouched', () => {
    expect(strip('&copy; &mdash; &unknown;')).toBe('&copy; &mdash; &unknown;');
  });

  it('collapses multiple &nbsp; and trims surrounding nbsp', () => {
    expect(strip('&nbsp;&nbsp;trimmed&nbsp;')).toBe('trimmed');
  });

  // --- regex stripper behavior (documented limitations) ---
  it('strips multiline tags because the matcher spans newlines', () => {
    expect(strip('<div\nclass="x">multi</div>')).toBe('multi');
  });

  it('stops at the first > inside an attribute value (regex limitation)', () => {
    expect(strip('<a title="x>y">link</a>')).toBe('y">link');
  });

  it('removes HTML comments as a tag-like span', () => {
    expect(strip('<!-- comment -->visible')).toBe('visible');
  });

  it('treats unencoded angle-bracket text as a tag span and removes it', () => {
    // "a < b and c > d": " < b and c > " matches /<[^>]*>/ and is removed
    expect(strip('a < b and c > d')).toBe('a  d');
  });

  // --- blank-line collapsing ---
  it('collapses runs of 3+ blank lines down to a single blank line', () => {
    expect(strip('line1\n\n\nline2\n\n\n\n\nline3')).toBe('line1\n\nline2\n\nline3');
  });

  it('keeps a single blank line (two newlines) intact', () => {
    expect(strip('a\n\nb')).toBe('a\n\nb');
  });

  // --- determinism / idempotency ---
  it('is deterministic for repeated calls on the same input', () => {
    const input = '<p>Hi &amp; <b>bye</b></p>\n\n\n\nx';
    expect(strip(input)).toBe(strip(input));
  });

  it('is idempotent: stripping already-stripped text changes nothing', () => {
    const once = strip('<p>Hello &amp; welcome</p>');
    expect(strip(once)).toBe(once);
  });

  it('does not throw on large input and strips all tags', () => {
    const large = '<span>x</span>'.repeat(5000);
    const out = strip(large);
    expect(out).toBe('x'.repeat(5000));
    expect(out).not.toContain('<');
  });
});
