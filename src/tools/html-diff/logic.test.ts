import { describe, expect, it } from 'vitest';
import { computeHtmlDiff } from './logic';

describe('computeHtmlDiff', () => {
  it('ignores inter-tag whitespace', () => {
    const parts = computeHtmlDiff('<a><b>x</b></a>', '<a>\n  <b>x</b>\n</a>');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('detects content changes', () => {
    const parts = computeHtmlDiff('<a><b>x</b></a>', '<a><b>y</b></a>');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });
});
