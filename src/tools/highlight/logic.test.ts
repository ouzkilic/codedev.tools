import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { highlightLogic } from './logic';

const ctx = (language: string): ToolContext => ({ options: { language }, secondary: '' });

describe('highlightLogic', () => {
  it('exposes a single language select option with auto default', () => {
    expect(highlightLogic.options).toHaveLength(1);
    const opt = highlightLogic.options![0];
    expect(opt.key).toBe('language');
    expect(opt.type).toBe('select');
    expect(opt.default).toBe('auto');
    const values = opt.choices!.map((c) => c.value);
    expect(values).toContain('auto');
    expect(values).toContain('javascript');
    expect(values).toContain('typescript');
    expect(values).toContain('json');
    expect(values).toContain('html');
    expect(values).toContain('xml');
    expect(values).toContain('css');
    expect(values).toContain('python');
    expect(values).toContain('bash');
    expect(values).toContain('sql');
    expect(values).toContain('go');
    expect(values).toContain('rust');
    expect(values).toContain('java');
  });

  it('highlights JavaScript keywords', async () => {
    const out = await highlightLogic.transform('const x = 1;', ctx('javascript'));
    expect(out).toContain('hljs-keyword');
    expect(out).toContain('>const</span>');
    expect(out).toContain('hljs-number');
  });

  it('highlights JSON input', async () => {
    const out = await highlightLogic.transform('{"a": 1}', ctx('json'));
    expect(out).toContain('hljs');
    expect(out).toContain('hljs-attr');
    expect(out).toContain('hljs-number');
    // JSON quotes are HTML-escaped
    expect(out).toContain('&quot;');
  });

  it('highlights TypeScript type annotations', async () => {
    const out = await highlightLogic.transform('const x: number = 1;', ctx('typescript'));
    expect(out).toContain('hljs-keyword');
    expect(out).toContain('hljs-built_in');
    expect(out).toContain('hljs-number');
  });

  it('highlights Python def/return keywords', async () => {
    const out = await highlightLogic.transform('def f():\n    return 1', ctx('python'));
    expect(out).toContain('hljs-keyword');
    expect(out).toContain('>def</span>');
    expect(out).toContain('>return</span>');
    // newline and indentation preserved
    expect(out).toContain('\n    ');
  });

  it('highlights CSS selectors and properties', async () => {
    const out = await highlightLogic.transform('a { color: red; }', ctx('css'));
    expect(out).toContain('hljs-selector-tag');
    expect(out).toContain('hljs-attribute');
  });

  it('highlights HTML tags and escapes the angle brackets', async () => {
    const out = await highlightLogic.transform('<div class="x">hi</div>', ctx('html'));
    expect(out).toContain('hljs-tag');
    expect(out).toContain('hljs-name');
    expect(out).toContain('hljs-attr');
    // raw < / > must be escaped so the output is safe HTML
    expect(out).not.toContain('<div');
    expect(out).toContain('&lt;');
    expect(out).toContain('&gt;');
  });

  it('highlights XML nested tags', async () => {
    const out = await highlightLogic.transform('<a><b/></a>', ctx('xml'));
    expect(out).toContain('hljs-tag');
    expect(out).toContain('hljs-name');
    expect(out).toContain('&lt;');
    expect(out).not.toContain('<a>');
  });

  it('highlights SQL keywords and operators', async () => {
    const out = await highlightLogic.transform('SELECT * FROM t', ctx('sql'));
    expect(out).toContain('hljs-keyword');
    expect(out).toContain('>SELECT</span>');
    expect(out).toContain('>FROM</span>');
  });

  it('highlights Go function definitions', async () => {
    const out = await highlightLogic.transform('func main() {}', ctx('go'));
    expect(out).toContain('hljs-keyword');
    expect(out).toContain('>func</span>');
    expect(out).toContain('hljs-title');
  });

  it('highlights Rust function definitions', async () => {
    const out = await highlightLogic.transform('fn main() {}', ctx('rust'));
    expect(out).toContain('hljs-keyword');
    expect(out).toContain('>fn</span>');
    expect(out).toContain('hljs-title');
  });

  it('highlights Java class declarations', async () => {
    const out = await highlightLogic.transform('public class A {}', ctx('java'));
    expect(out).toContain('hljs-keyword');
    expect(out).toContain('>public</span>');
    expect(out).toContain('>class</span>');
    expect(out).toContain('hljs-title');
  });

  it('highlights Bash built-ins', async () => {
    const out = await highlightLogic.transform('echo hello', ctx('bash'));
    expect(out).toContain('hljs-built_in');
    expect(out).toContain('>echo</span>');
  });

  it('auto-detects when language is auto', async () => {
    const out = await highlightLogic.transform('{"a":1}', ctx('auto'));
    expect(out).toContain('hljs');
    expect(out).toContain('hljs-number');
  });

  it('defaults to auto-detect when no language option is provided', async () => {
    const out = await highlightLogic.transform('def f():\n    return 1', {
      options: {},
      secondary: '',
    });
    // auto-detect of python should still find keywords
    expect(out).toContain('hljs-keyword');
  });

  it('escapes HTML special characters in string literals', async () => {
    const out = await highlightLogic.transform('const s = "<a> & b";', ctx('javascript'));
    expect(out).toContain('&lt;a&gt;');
    expect(out).toContain('&amp;');
    expect(out).toContain('&quot;');
    expect(out).not.toContain('<a>');
  });

  it('escapes a bare ampersand', async () => {
    const out = await highlightLogic.transform('a & b', ctx('javascript'));
    expect(out).toContain('&amp;');
    expect(out).not.toMatch(/[^&;]& /);
  });

  it('returns empty string for empty input', async () => {
    expect(await highlightLogic.transform('', ctx('javascript'))).toBe('');
    expect(await highlightLogic.transform('', ctx('auto'))).toBe('');
  });

  it('preserves whitespace-only input without adding markup', async () => {
    const out = await highlightLogic.transform('   \n\t', ctx('javascript'));
    expect(out).toBe('   \n\t');
    expect(out).not.toContain('<span');
  });

  it('passes through plain text without highlight spans', async () => {
    const out = await highlightLogic.transform('hello world', ctx('javascript'));
    expect(out).toBe('hello world');
    expect(out).not.toContain('<span');
  });

  it('preserves unicode and emoji characters', async () => {
    const out = await highlightLogic.transform('const e = "😀café";', ctx('javascript'));
    expect(out).toContain('😀');
    expect(out).toContain('café');
    expect(out).toContain('hljs-string');
  });

  it('throws on an unknown language', async () => {
    await expect(highlightLogic.transform('const x = 1;', ctx('not-a-lang'))).rejects.toThrow(
      /Unknown language/,
    );
  });

  it('is deterministic for identical input and options', async () => {
    const a = await highlightLogic.transform('const x = 1;', ctx('javascript'));
    const b = await highlightLogic.transform('const x = 1;', ctx('javascript'));
    expect(a).toBe(b);
  });

  it('handles large input without crashing and preserves line count', async () => {
    const lines = Array.from({ length: 500 }, (_, i) => `const v${i} = ${i};`);
    const src = lines.join('\n');
    const out = await highlightLogic.transform(src, ctx('javascript'));
    expect(out).toContain('hljs-keyword');
    // newlines are passed through verbatim
    expect(out.split('\n')).toHaveLength(500);
  });
});
