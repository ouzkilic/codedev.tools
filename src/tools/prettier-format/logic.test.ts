import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { formatCode, prettierFormatLogic } from './logic';

const ctx = (lang?: string): ToolContext => ({
  options: lang ? { lang } : {},
  secondary: '',
});

describe('formatCode — happy paths per language', () => {
  it('formats JavaScript', async () => {
    expect(await formatCode('const x={a:1,b:2}', 'javascript')).toBe('const x = { a: 1, b: 2 };\n');
  });

  it('adds semicolons and double quotes to JavaScript', async () => {
    expect(await formatCode("const s='hi'", 'javascript')).toBe('const s = "hi";\n');
  });

  it('formats TypeScript with type annotations', async () => {
    expect(await formatCode('let x:number=5', 'typescript')).toBe('let x: number = 5;\n');
  });

  it('formats JSON object', async () => {
    expect(await formatCode('{"a":1}', 'json')).toBe('{ "a": 1 }\n');
  });

  it('formats JSON array', async () => {
    expect(await formatCode('[1,2,3]', 'json')).toBe('[1, 2, 3]\n');
  });

  it('formats CSS', async () => {
    expect(await formatCode('a{color:red}', 'css')).toBe('a {\n  color: red;\n}\n');
  });

  it('formats SCSS with nesting', async () => {
    expect(await formatCode('.a{ .b{color:red} }', 'scss')).toBe(
      '.a {\n  .b {\n    color: red;\n  }\n}\n',
    );
  });

  it('formats LESS with variables', async () => {
    expect(await formatCode('@v:red;a{color:@v}', 'less')).toBe('@v: red;\na {\n  color: @v;\n}\n');
  });

  it('formats HTML', async () => {
    expect(await formatCode('<div><span>hi</span></div>', 'html')).toBe(
      '<div><span>hi</span></div>\n',
    );
  });

  it('formats Markdown (collapses spaces, normalizes heading)', async () => {
    expect(await formatCode('#  Title\n\nfoo   bar', 'markdown')).toBe('# Title\n\nfoo bar\n');
  });
});

describe('formatCode — parser selection branches', () => {
  it('falls back to babel parser for an unknown language', async () => {
    // PARSERS[lang] is undefined -> 'babel'; babel/estree plugins are NOT pushed
    // for unknown langs, but prettier/standalone still needs a plugin. The known
    // behavior: babel parser without its plugin should fail to load the parser.
    await expect(formatCode('const x={a:1}', 'totally-unknown')).rejects.toThrow();
  });

  it('treats empty lang string as babel fallback (no babel plugin pushed) -> throws', async () => {
    await expect(formatCode('const x={a:1}', '')).rejects.toThrow();
  });
});

describe('formatCode — edge cases', () => {
  it('returns empty string for empty input (CSS)', async () => {
    expect(await formatCode('', 'css')).toBe('');
  });

  it('returns empty string for whitespace-only JavaScript', async () => {
    expect(await formatCode('   ', 'javascript')).toBe('');
  });

  it('preserves unicode / emoji string content', async () => {
    expect(await formatCode('const a="😀🎉"', 'javascript')).toBe('const a = "😀🎉";\n');
  });

  it('handles special characters in JSON string values', async () => {
    const out = await formatCode('{"k":"a\\tb\\n"}', 'json');
    expect(out).toContain('"k"');
    expect(out).toContain('\\t');
    expect(out).toContain('\\n');
    expect(out.endsWith('\n')).toBe(true);
  });

  it('formats negative and zero numbers in JS', async () => {
    expect(await formatCode('const n=[-0,0,-42]', 'javascript')).toBe('const n = [-0, 0, -42];\n');
  });

  it('formats large numeric / boundary literals', async () => {
    const out = await formatCode('const big=9007199254740991', 'javascript');
    expect(out).toBe('const big = 9007199254740991;\n');
  });

  it('handles large input without crashing and keeps every statement', async () => {
    const lines = Array.from({ length: 500 }, (_, i) => `const v${i}=${i}`).join(';');
    const out = await formatCode(lines, 'javascript');
    expect(out).toContain('const v0 = 0;');
    expect(out).toContain('const v499 = 499;');
    expect(out.endsWith('\n')).toBe(true);
  });
});

describe('formatCode — error paths', () => {
  it('rejects invalid JavaScript', async () => {
    await expect(formatCode('const = =', 'javascript')).rejects.toThrow();
  });

  it('rejects malformed JSON', async () => {
    await expect(formatCode('{bad json', 'json')).rejects.toThrow();
  });

  it('rejects malformed CSS', async () => {
    await expect(formatCode('a { color: ', 'css')).rejects.toThrow();
  });

  it('rejects invalid TypeScript syntax', async () => {
    await expect(formatCode('let x: : number', 'typescript')).rejects.toThrow();
  });
});

describe('formatCode — idempotency / determinism', () => {
  it('is idempotent: formatting already-formatted JS yields the same output', async () => {
    const once = await formatCode('const x={a:1,b:2}', 'javascript');
    const twice = await formatCode(once, 'javascript');
    expect(twice).toBe(once);
  });

  it('is idempotent for CSS', async () => {
    const once = await formatCode('a{color:red}', 'css');
    const twice = await formatCode(once, 'css');
    expect(twice).toBe(once);
  });

  it('is deterministic: same input/lang produces identical output across calls', async () => {
    const a = await formatCode('let x:number=5', 'typescript');
    const b = await formatCode('let x:number=5', 'typescript');
    expect(a).toBe(b);
  });
});

describe('prettierFormatLogic — options metadata', () => {
  it('exposes a single lang select option defaulting to javascript', () => {
    const opts = prettierFormatLogic.options ?? [];
    expect(opts).toHaveLength(1);
    const lang = opts[0];
    expect(lang.key).toBe('lang');
    expect(lang.type).toBe('select');
    expect(lang.default).toBe('javascript');
  });

  it('offers all eight supported languages as choices', () => {
    const lang = (prettierFormatLogic.options ?? [])[0];
    const values = (lang.choices ?? []).map((c) => c.value);
    expect(values).toEqual([
      'javascript',
      'typescript',
      'json',
      'css',
      'scss',
      'less',
      'html',
      'markdown',
    ]);
  });
});

describe('prettierFormatLogic.transform — ctx wiring', () => {
  it('uses the lang option from ctx', async () => {
    expect(await prettierFormatLogic.transform('a{color:red}', ctx('css'))).toBe(
      'a {\n  color: red;\n}\n',
    );
  });

  it('routes typescript through the typescript parser', async () => {
    expect(await prettierFormatLogic.transform('let x:number=5', ctx('typescript'))).toBe(
      'let x: number = 5;\n',
    );
  });

  it('defaults to javascript when no lang option is present', async () => {
    expect(await prettierFormatLogic.transform('const x={a:1}', ctx())).toBe('const x = { a: 1 };\n');
  });

  it('propagates formatting errors as a rejected promise', async () => {
    await expect(prettierFormatLogic.transform('const = =', ctx('javascript'))).rejects.toThrow();
  });
});
