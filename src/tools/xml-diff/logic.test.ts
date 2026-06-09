import { describe, it, expect } from 'vitest';
import type { Change } from 'diff';
import { normalizeXml, computeXmlDiff } from './logic';

const rightFromChanges = (changes: Change[]): string =>
  changes.filter((p) => !p.removed).map((p) => p.value).join('');
const leftFromChanges = (changes: Change[]): string =>
  changes.filter((p) => !p.added).map((p) => p.value).join('');

describe('normalizeXml', () => {
  it('normalizes formatting', () => {
    expect(normalizeXml('<r><a>1</a></r>')).toBe('<r>\n  <a>1</a>\n</r>');
  });

  it('uses two-space indentation and newline separators for nested elements', () => {
    expect(normalizeXml('<r><a><b>1</b></a></r>')).toBe(
      '<r>\n  <a>\n    <b>1</b>\n  </a>\n</r>',
    );
  });

  it('is idempotent on already-formatted XML', () => {
    const formatted = normalizeXml('<r><a>1</a></r>');
    expect(normalizeXml(formatted)).toBe(formatted);
  });

  it('preserves attributes on elements', () => {
    expect(normalizeXml('<r x="1"><a b="2">v</a></r>')).toBe(
      '<r x="1">\n  <a b="2">v</a>\n</r>',
    );
  });

  it('preserves self-closing tags', () => {
    expect(normalizeXml('<r><a/></r>')).toBe('<r>\n  <a/>\n</r>');
  });

  it('keeps the XML declaration on its own line', () => {
    expect(normalizeXml('<?xml version="1.0"?><r><a>1</a></r>')).toBe(
      '<?xml version="1.0"?>\n<r>\n  <a>1</a>\n</r>',
    );
  });

  it('preserves unicode and emoji content', () => {
    expect(normalizeXml('<r><a>café 😀</a></r>')).toBe('<r>\n  <a>café 😀</a>\n</r>');
  });

  it('collapses extra surrounding whitespace from input formatting', () => {
    expect(normalizeXml('<r>\n   <a>1</a>\n</r>')).toBe('<r>\n  <a>1</a>\n</r>');
  });

  it('throws on an empty string', () => {
    expect(() => normalizeXml('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => normalizeXml('   ')).toThrow();
  });

  it('throws on non-XML text', () => {
    expect(() => normalizeXml('not xml')).toThrow();
  });
});

describe('computeXmlDiff', () => {
  it('ignores whitespace/formatting differences', () => {
    const parts = computeXmlDiff('<r><a>1</a></r>', '<r>\n  <a>1</a>\n</r>');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('returns a single unchanged chunk for identical normalized inputs', () => {
    const parts = computeXmlDiff('<r><a>1</a></r>', '<r><a>1</a></r>');
    expect(parts).toHaveLength(1);
    expect(parts[0].added).toBeFalsy();
    expect(parts[0].removed).toBeFalsy();
    expect(parts[0].value).toBe('<r>\n  <a>1</a>\n</r>\n');
  });

  it('detects content changes as paired removed/added chunks', () => {
    const parts = computeXmlDiff('<r><a>1</a></r>', '<r><a>2</a></r>');
    expect(parts.some((p) => p.removed)).toBe(true);
    expect(parts.some((p) => p.added)).toBe(true);
    expect(parts.find((p) => p.removed)?.value).toContain('<a>1</a>');
    expect(parts.find((p) => p.added)?.value).toContain('<a>2</a>');
  });

  it('detects an added element with no removals', () => {
    const parts = computeXmlDiff('<r><a>1</a></r>', '<r><a>1</a><b>2</b></r>');
    expect(parts.some((p) => p.added)).toBe(true);
    expect(parts.some((p) => p.removed)).toBe(false);
  });

  it('detects a removed element with no additions', () => {
    const parts = computeXmlDiff('<r><a>1</a><b>2</b></r>', '<r><a>1</a></r>');
    expect(parts.some((p) => p.removed)).toBe(true);
    expect(parts.some((p) => p.added)).toBe(false);
  });

  it('appends a trailing newline so the right side reconstructs to normalized right + newline', () => {
    const parts = computeXmlDiff('<r><a>1</a></r>', '<r><a>2</a></r>');
    expect(rightFromChanges(parts)).toBe(`${normalizeXml('<r><a>2</a></r>')}\n`);
  });

  it('reconstructs the left side from non-added chunks', () => {
    const parts = computeXmlDiff('<r><a>1</a></r>', '<r><a>2</a></r>');
    expect(leftFromChanges(parts)).toBe(`${normalizeXml('<r><a>1</a></r>')}\n`);
  });

  it('diffs unicode content changes', () => {
    const parts = computeXmlDiff('<r><a>café</a></r>', '<r><a>tea 🍵</a></r>');
    expect(parts.some((p) => p.removed && p.value.includes('café'))).toBe(true);
    expect(parts.some((p) => p.added && p.value.includes('🍵'))).toBe(true);
  });

  it('handles attribute-only differences as a content change', () => {
    const parts = computeXmlDiff('<r x="1"/>', '<r x="2"/>');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('throws when the left input is invalid XML', () => {
    expect(() => computeXmlDiff('not xml', '<a/>')).toThrow();
  });

  it('throws when the right input is invalid XML', () => {
    expect(() => computeXmlDiff('<a/>', 'not xml')).toThrow();
  });

  it('throws when either input is empty', () => {
    expect(() => computeXmlDiff('', '<a/>')).toThrow();
    expect(() => computeXmlDiff('<a/>', '')).toThrow();
  });
});
