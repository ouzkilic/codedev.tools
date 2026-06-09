import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { svgToJsxLogic } from './logic';

const ctx = (overrides: Partial<ToolContext> = {}): ToolContext => ({
  options: { mode: 'jsx' },
  secondary: '',
  ...overrides,
});

describe('svgToJsxLogic', () => {
  it('exposes a single mode select option with jsx default', () => {
    expect(svgToJsxLogic.options).toHaveLength(1);
    const opt = svgToJsxLogic.options?.[0];
    expect(opt?.key).toBe('mode');
    expect(opt?.type).toBe('select');
    expect(opt?.default).toBe('jsx');
    expect(opt?.choices?.map((c) => c.value)).toEqual(['jsx', 'datauri']);
  });

  // --- JSX mode --------------------------------------------------------------

  it('converts attribute names and class in jsx mode', () => {
    const out = svgToJsxLogic.transform(
      '<svg><path stroke-width="2" class="icon" /></svg>',
      ctx(),
    );
    expect(out).toContain('strokeWidth="2"');
    expect(out).toContain('className="icon"');
  });

  it('defaults to jsx mode when no options provided', () => {
    const out = svgToJsxLogic.transform('<svg class="x" />');
    expect(out).toContain('className="x"');
  });

  it('defaults to jsx mode when mode option is missing/undefined', () => {
    const out = svgToJsxLogic.transform('<svg class="x" />', ctx({ options: {} }));
    expect(out).toContain('className="x"');
  });

  it('camelCases hyphenated attribute (only segment after first hyphen)', () => {
    const out = svgToJsxLogic.transform('<path fill-rule="evenodd" />', ctx());
    expect(out).toContain('fillRule="evenodd"');
  });

  it('camelCases multiple hyphenated attributes in one tag', () => {
    const out = svgToJsxLogic.transform(
      '<path stroke-linecap="round" stroke-linejoin="round" />',
      ctx(),
    );
    expect(out).toContain('strokeLinecap="round"');
    expect(out).toContain('strokeLinejoin="round"');
  });

  it('replaces every occurrence of class= with className=', () => {
    const out = svgToJsxLogic.transform(
      '<g class="a"><rect class="b" /></g>',
      ctx(),
    );
    expect(out).not.toMatch(/\sclass=/);
    expect((out.match(/className=/g) ?? []).length).toBe(2);
  });

  it('does not corrupt an existing className attribute', () => {
    const out = svgToJsxLogic.transform('<svg className="already" />', ctx());
    expect(out).toContain('className="already"');
    // \bclass= cannot match inside className=, so no double-replacement
    expect(out).not.toContain('classNameName');
  });

  it('only matches hyphenated attrs preceded by whitespace', () => {
    // No leading whitespace before the attribute name -> not transformed.
    const out = svgToJsxLogic.transform('<svgstroke-width="2" />', ctx());
    expect(out).toContain('stroke-width="2"');
  });

  it('leaves a hyphenated value (not an attribute name) untouched', () => {
    const out = svgToJsxLogic.transform('<svg id="foo-bar" />', ctx());
    expect(out).toContain('id="foo-bar"');
  });

  it('leaves non-hyphenated standard attributes unchanged', () => {
    const out = svgToJsxLogic.transform('<svg width="24" height="24" viewBox="0 0 24 24" />', ctx());
    expect(out).toContain('width="24"');
    expect(out).toContain('height="24"');
    expect(out).toContain('viewBox="0 0 24 24"');
  });

  it('preserves the overall tag structure and content', () => {
    const input = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" class="bg" /></svg>';
    const out = svgToJsxLogic.transform(input, ctx());
    expect(out).toContain('<svg');
    expect(out).toContain('</svg>');
    expect(out).toContain('d="M0 0h24v24H0z"');
    expect(out).toContain('className="bg"');
  });

  it('jsx mode on empty input returns empty string', () => {
    expect(svgToJsxLogic.transform('', ctx())).toBe('');
  });

  it('jsx mode on whitespace-only input is unchanged', () => {
    expect(svgToJsxLogic.transform('   \n  ', ctx())).toBe('   \n  ');
  });

  it('is idempotent for already-converted jsx markup', () => {
    const once = svgToJsxLogic.transform('<path stroke-width="2" class="x" />', ctx());
    const twice = svgToJsxLogic.transform(once, ctx());
    expect(twice).toBe(once);
  });

  // --- Data URI mode ---------------------------------------------------------

  it('produces a data URI in datauri mode', () => {
    const out = svgToJsxLogic.transform('<svg></svg>', ctx({ options: { mode: 'datauri' } }));
    expect(out.startsWith('data:image/svg+xml,')).toBe(true);
  });

  it('percent-encodes the SVG payload in datauri mode', () => {
    const out = svgToJsxLogic.transform('<svg></svg>', ctx({ options: { mode: 'datauri' } }));
    expect(out).toBe('data:image/svg+xml,' + encodeURIComponent('<svg></svg>'));
    expect(out).toContain('%3Csvg%3E%3C%2Fsvg%3E');
  });

  it('trims surrounding whitespace before encoding in datauri mode', () => {
    const out = svgToJsxLogic.transform('  <svg/>  \n', ctx({ options: { mode: 'datauri' } }));
    expect(out).toBe('data:image/svg+xml,' + encodeURIComponent('<svg/>'));
  });

  it('does not camelCase or rename class in datauri mode', () => {
    const out = svgToJsxLogic.transform('<svg class="x" stroke-width="2"/>', ctx({ options: { mode: 'datauri' } }));
    const decoded = decodeURIComponent(out.slice('data:image/svg+xml,'.length));
    expect(decoded).toContain('class="x"');
    expect(decoded).toContain('stroke-width="2"');
  });

  it('datauri mode on empty input yields the prefix only', () => {
    const out = svgToJsxLogic.transform('', ctx({ options: { mode: 'datauri' } }));
    expect(out).toBe('data:image/svg+xml,');
  });

  // --- Unicode / large input -------------------------------------------------

  it('handles unicode and emoji content in jsx mode', () => {
    const out = svgToJsxLogic.transform('<text class="t">héllo 😀 漢字</text>', ctx());
    expect(out).toContain('className="t"');
    expect(out).toContain('héllo 😀 漢字');
  });

  it('encodes unicode content in datauri mode', () => {
    const input = '<text>😀</text>';
    const out = svgToJsxLogic.transform(input, ctx({ options: { mode: 'datauri' } }));
    expect(out).toBe('data:image/svg+xml,' + encodeURIComponent(input));
  });

  it('handles large input with many hyphenated attributes', () => {
    const item = '<path stroke-width="1" class="i" />';
    const input = `<svg>${item.repeat(500)}</svg>`;
    const out = svgToJsxLogic.transform(input, ctx());
    expect((out.match(/strokeWidth="1"/g) ?? []).length).toBe(500);
    expect((out.match(/className="i"/g) ?? []).length).toBe(500);
    expect(out).not.toMatch(/\sstroke-width=/);
  });
});
