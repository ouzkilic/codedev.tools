import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { cssMinifyLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };
const run = (input: string): string => cssMinifyLogic.transform(input, ctx);

describe('cssMinifyLogic', () => {
  it('minifies basic css', () => {
    expect(run('a { color: red; }')).toBe('a{color:red}');
  });

  it('removes comments and trailing semicolon', () => {
    expect(run('/* c */ b { margin : 0 ; }')).toBe('b{margin:0}');
  });

  it('handles selectors with commas', () => {
    expect(run('a,b { x:1 }')).toBe('a,b{x:1}');
  });

  it('returns empty string for empty input', () => {
    expect(run('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(run('   \n\t  ')).toBe('');
  });

  it('returns empty string when input is only a comment', () => {
    expect(run('/* nothing but a comment */')).toBe('');
  });

  it('collapses newlines, tabs and multiple spaces into minimal form', () => {
    expect(run('a\n\t {\n  color :   red ;\n}\n')).toBe('a{color:red}');
  });

  it('preserves multiple declarations with internal semicolons', () => {
    expect(run('a { color: red; background: blue; }')).toBe('a{color:red;background:blue}');
  });

  it('handles multiple rules', () => {
    expect(run('a { color: red; } b { color: blue; }')).toBe('a{color:red}b{color:blue}');
  });

  it('removes whitespace around commas in property values', () => {
    // commas everywhere get surrounding whitespace stripped
    expect(run('a { font: Arial , sans-serif ; }')).toBe('a{font:Arial,sans-serif}');
  });

  it('strips whitespace around colons including pseudo-classes', () => {
    expect(run('a : hover { color : red }')).toBe('a:hover{color:red}');
  });

  it('removes a multiline comment between rules', () => {
    expect(run('a{color:red}/* mid\n comment */b{color:blue}')).toBe('a{color:red}b{color:blue}');
  });

  it('handles only the first of nested-looking comment terminators (non-greedy)', () => {
    // non-greedy: /* ... */ stops at first */, leaving the rest
    expect(run('/* one */keep/* two */')).toBe('keep');
  });

  it('collapses an empty rule block', () => {
    expect(run('a {   }')).toBe('a{}');
  });

  it('converts ";}" to "}" only at the boundary', () => {
    expect(run('a{color:red;;}')).toBe('a{color:red;}');
  });

  it('is idempotent: minifying already-minified css is a no-op', () => {
    const once = run('a { color: red; background: blue; } b , c { margin: 0; }');
    expect(run(once)).toBe(once);
  });

  it('handles unicode content in values', () => {
    expect(run('a { content: "héllo wörld"; }')).toBe('a{content:"héllo wörld"}');
  });

  it('handles emoji in content values', () => {
    expect(run('a { content: "🎉 done"; }')).toBe('a{content:"🎉 done"}');
  });

  it('handles negative and zero numeric values', () => {
    expect(run('a { margin: -5px; top: 0; }')).toBe('a{margin:-5px;top:0}');
  });

  it('handles media queries (at-rules with nesting)', () => {
    expect(run('@media (min-width: 600px) { a { color: red; } }')).toBe(
      '@media (min-width:600px){a{color:red}}',
    );
  });

  it('does not crash on large input and minifies it fully', () => {
    const big = 'a { color: red; }\n'.repeat(2000);
    const out = run(big);
    expect(out).toBe('a{color:red}'.repeat(2000));
    expect(out).not.toContain('\n');
  });

  it('strips leading and trailing whitespace via trim', () => {
    expect(run('   a{color:red}   ')).toBe('a{color:red}');
  });

  it('preserves leading whitespace inside string values within the collapse', () => {
    // multiple spaces inside a value become a single space (regex collapses all whitespace)
    expect(run('a { content: "x    y"; }')).toBe('a{content:"x y"}');
  });

  it('handles input with no braces (raw declaration text)', () => {
    expect(run('color : red ; ')).toBe('color:red;');
  });

  it('removes whitespace around semicolons between declarations', () => {
    expect(run('a{ color:red ; background:blue }')).toBe('a{color:red;background:blue}');
  });

  it('does not throw on structurally malformed css (no error path)', () => {
    expect(() => run('a { color: red')).not.toThrow();
    expect(run('a { color: red')).toBe('a{color:red');
  });
});
