import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { htmlMinifyLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };
const run = (input: string) => htmlMinifyLogic.transform(input, ctx);

describe('htmlMinifyLogic', () => {
  // --- existing assertions (kept) ---
  it('collapses whitespace between tags', () => {
    expect(run('<div>  <p>Hi</p>  </div>')).toBe('<div><p>Hi</p></div>');
  });

  it('removes HTML comments', () => {
    expect(run('<!-- c --><b>x</b>')).toBe('<b>x</b>');
  });

  it('preserves single spaces inside text', () => {
    expect(run('<p>a b</p>')).toBe('<p>a b</p>');
  });

  // --- empty / whitespace-only inputs ---
  it('returns empty string for empty input', () => {
    expect(run('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(run('   \n\t  ')).toBe('');
  });

  it('returns empty string when input is only a comment', () => {
    expect(run('<!-- nothing to see here -->')).toBe('');
  });

  // --- comment handling ---
  it('removes multiline comments spanning newlines', () => {
    expect(run('<a>\n<!--\n multi\n line\n-->\n<b>')).toBe('<a><b>');
  });

  it('removes multiple comments in one pass', () => {
    expect(run('<!--1--><x/><!--2--><y/><!--3-->')).toBe('<x/><y/>');
  });

  it('handles non-greedy comment matching (two adjacent comments)', () => {
    // non-greedy means each --> ends its own comment; text between is kept
    expect(run('<!--a-->keep<!--b-->')).toBe('keep');
  });

  it('removes comment containing tag-like content', () => {
    expect(run('<p>x</p><!-- <div>ignored</div> --><p>y</p>')).toBe('<p>x</p><p>y</p>');
  });

  // --- whitespace collapsing ---
  it('collapses internal runs of whitespace in text to a single space', () => {
    expect(run('<p>a     b\t\tc\n\nd</p>')).toBe('<p>a b c d</p>');
  });

  it('collapses tabs and newlines between tags', () => {
    expect(run('<ul>\n\t<li>1</li>\n\t<li>2</li>\n</ul>')).toBe('<ul><li>1</li><li>2</li></ul>');
  });

  it('trims leading and trailing whitespace', () => {
    expect(run('   <p>hi</p>   ')).toBe('<p>hi</p>');
  });

  it('collapses whitespace inside attributes to a single space', () => {
    // /\s+/ -> ' ' collapses the attribute spacing too
    expect(run('<a   href="x"    class="y">t</a>')).toBe('<a href="x" class="y">t</a>');
  });

  // --- structural edge cases ---
  it('leaves a no-whitespace tag sequence unchanged (idempotent shape)', () => {
    expect(run('<div><span>x</span></div>')).toBe('<div><span>x</span></div>');
  });

  it('is idempotent: minifying already-minified output yields the same result', () => {
    const once = run('<div>  <p>Hi  there</p>  </div>');
    expect(run(once)).toBe(once);
  });

  it('keeps text that has no surrounding tags', () => {
    expect(run('just  plain   text')).toBe('just plain text');
  });

  it('does not insert a space where text directly abuts a tag', () => {
    expect(run('<p>start</p>\n\nend')).toBe('<p>start</p> end');
  });

  // --- unicode / emoji / special chars ---
  it('preserves unicode and emoji content', () => {
    // leading/trailing spaces inside the text node collapse to a single space (not removed),
    // because >\s+< only matches whitespace directly between tags.
    expect(run('<p>  héllo 世界 🚀  </p>')).toBe('<p> héllo 世界 🚀 </p>');
  });

  it('preserves entity references and special characters', () => {
    expect(run('<p>&amp;  &lt;  &#x1F600;</p>')).toBe('<p>&amp; &lt; &#x1F600;</p>');
  });

  it('collapses an interior run of spaces in text to a single space', () => {
    // a run of two ASCII spaces inside a text node collapses to one
    expect(run('<p>a  b</p>')).toBe('<p>a b</p>');
  });

  // --- large input / determinism ---
  it('handles large input deterministically', () => {
    const big = '<li>  item  </li>'.repeat(1000);
    const out = run(big);
    // inner spaces collapse to one and survive; only between-tag whitespace (</li><li>) is removed
    expect(out).toBe('<li> item </li>'.repeat(1000));
    expect(out.length).toBe('<li> item </li>'.length * 1000);
  });

  it('produces identical output across repeated calls (determinism)', () => {
    const input = '<section>\n  <h1>Title</h1>\n  <!-- note -->\n  <p>Body  text</p>\n</section>';
    expect(run(input)).toBe(run(input));
  });

  // --- works without a context argument (ctx is optional) ---
  it('works when called without a context argument', () => {
    expect(htmlMinifyLogic.transform('<div>  <p>x</p>  </div>')).toBe('<div><p>x</p></div>');
  });

  it('ignores option values since the transform takes no options', () => {
    const withOpts: ToolContext = { options: { foo: true, bar: 'baz' }, secondary: 'ignored' };
    expect(htmlMinifyLogic.transform('<div>  <p>a  b</p>  </div>', withOpts)).toBe('<div><p>a b</p></div>');
  });
});
