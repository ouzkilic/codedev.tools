import { describe, expect, it } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { svgOptimizeLogic } from './logic';

const ctx: ToolContext = { options: {}, secondary: '' };

describe('svgOptimizeLogic', () => {
  it('removes xml declaration, comments and collapses whitespace', () => {
    const input = '<?xml version="1.0"?>\n<svg>\n  <!-- a comment -->\n  <rect/>\n</svg>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<svg><rect/></svg>');
  });

  it('preserves attributes', () => {
    const input = '<svg width="10" height="10">\n  <rect x="1" y="2"/>\n</svg>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe(
      '<svg width="10" height="10"><rect x="1" y="2"/></svg>',
    );
  });

  it('is idempotent on already-minified svg', () => {
    const minified = '<svg><rect/></svg>';
    expect(svgOptimizeLogic.transform(minified, ctx)).toBe(minified);
  });

  it('runs idempotently when applied twice', () => {
    const input = '<?xml version="1.0"?>\n<svg>\n  <!-- hi -->\n  <rect/>\n</svg>';
    const once = svgOptimizeLogic.transform(input, ctx);
    const twice = svgOptimizeLogic.transform(once, ctx);
    expect(twice).toBe(once);
  });

  it('works when ctx is omitted (transform arg is optional)', () => {
    const input = '<svg>\n  <rect/>\n</svg>';
    expect(svgOptimizeLogic.transform(input)).toBe('<svg><rect/></svg>');
  });

  it('returns empty string for empty input', () => {
    expect(svgOptimizeLogic.transform('', ctx)).toBe('');
  });

  it('reduces a whitespace-only string to empty (trimmed)', () => {
    expect(svgOptimizeLogic.transform('   \n\t  ', ctx)).toBe('');
  });

  it('removes a single-line xml declaration', () => {
    const input = '<?xml version="1.0" encoding="UTF-8"?><svg></svg>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<svg></svg>');
  });

  it('removes a multiline xml declaration', () => {
    const input = '<?xml\n  version="1.0"\n  encoding="UTF-8"\n?>\n<svg/>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<svg/>');
  });

  it('removes a DOCTYPE declaration case-insensitively', () => {
    const input = '<!doctype svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "x.dtd">\n<svg/>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<svg/>');
  });

  it('removes an uppercase DOCTYPE declaration', () => {
    const input = '<!DOCTYPE svg>\n<svg/>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<svg/>');
  });

  it('removes multiple comments including multiline ones', () => {
    const input = '<svg><!-- first --><!--\n multi\n line\n --><rect/></svg>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<svg><rect/></svg>');
  });

  it('collapses whitespace between adjacent tags', () => {
    const input = '<svg>   \n\t   <rect/>   </svg>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<svg><rect/></svg>');
  });

  it('collapses internal whitespace runs to a single space within text', () => {
    const input = '<text>Hello     world</text>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<text>Hello world</text>');
  });

  it('collapses newlines and tabs inside text to a single space', () => {
    const input = '<text>a\n\t  b</text>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<text>a b</text>');
  });

  it('collapses whitespace inside attribute values too (known behavior)', () => {
    const input = '<path d="M0   0  L10   10"/>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<path d="M0 0 L10 10"/>');
  });

  it('preserves unicode and emoji content', () => {
    const input = '<svg>\n  <text>café 🚀 日本語</text>\n</svg>';
    expect(svgOptimizeLogic.transform(input, ctx)).toBe('<svg><text>café 🚀 日本語</text></svg>');
  });

  it('handles a full realistic svg document', () => {
    const input = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">',
      '  <!-- icon -->',
      '  <path d="M12 2 L2 22 L22 22 Z" fill="black"/>',
      '</svg>',
    ].join('\n');
    expect(svgOptimizeLogic.transform(input, ctx)).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M12 2 L2 22 L22 22 Z" fill="black"/></svg>',
    );
  });

  it('handles large input efficiently and minifies it', () => {
    const inner = Array.from({ length: 2000 }, (_, i) => `\n  <rect x="${i}"/>`).join('');
    const input = `<?xml version="1.0"?>\n<svg>${inner}\n</svg>`;
    const out = svgOptimizeLogic.transform(input, ctx);
    expect(out.startsWith('<svg><rect')).toBe(true);
    expect(out.endsWith('</svg>')).toBe(true);
    expect(out).not.toContain('<?xml');
    expect(out).not.toContain('\n');
    expect(out).not.toContain('>  <');
  });

  it('ignores option values since transform is options-independent', () => {
    const input = '<svg>\n  <rect/>\n</svg>';
    const withOpts: ToolContext = { options: { foo: true, bar: 'baz' }, secondary: 'ignored' };
    expect(svgOptimizeLogic.transform(input, withOpts)).toBe(
      svgOptimizeLogic.transform(input, ctx),
    );
  });

  it('leaves plain text with no tags or markup minimally normalized', () => {
    expect(svgOptimizeLogic.transform('  just   text  ', ctx)).toBe('just text');
  });
});
