import { describe, it, expect } from 'vitest';
import { normalizeXml, computeXmlDiff } from './logic';

describe('xmlDiff', () => {
  it('normalizes formatting', () => {
    expect(normalizeXml('<r><a>1</a></r>')).toBe('<r>\n  <a>1</a>\n</r>');
  });
  it('ignores whitespace/formatting differences', () => {
    const parts = computeXmlDiff('<r><a>1</a></r>', '<r>\n  <a>1</a>\n</r>');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });
  it('detects content changes', () => {
    const parts = computeXmlDiff('<r><a>1</a></r>', '<r><a>2</a></r>');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });
  it('throws on invalid XML', () => {
    expect(() => computeXmlDiff('not xml', '<a/>')).toThrow();
  });
});
