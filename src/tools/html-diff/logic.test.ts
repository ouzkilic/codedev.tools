import { describe, expect, it } from 'vitest';
import type { Change } from 'diff';
import { computeHtmlDiff } from './logic';

// Helpers for asserting on the diff output.
function reconstructLeft(parts: Change[]): string {
  return parts
    .filter((p) => !p.added)
    .map((p) => p.value)
    .join('');
}

function reconstructRight(parts: Change[]): string {
  return parts
    .filter((p) => !p.removed)
    .map((p) => p.value)
    .join('');
}

function addedText(parts: Change[]): string {
  return parts
    .filter((p) => p.added)
    .map((p) => p.value)
    .join('');
}

function removedText(parts: Change[]): string {
  return parts
    .filter((p) => p.removed)
    .map((p) => p.value)
    .join('');
}

describe('computeHtmlDiff', () => {
  it('ignores inter-tag whitespace (existing case)', () => {
    const parts = computeHtmlDiff('<a><b>x</b></a>', '<a>\n  <b>x</b>\n</a>');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('detects content changes (existing case)', () => {
    const parts = computeHtmlDiff('<a><b>x</b></a>', '<a><b>y</b></a>');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('returns an array of Change objects', () => {
    const parts = computeHtmlDiff('<a></a>', '<a></a>');
    expect(Array.isArray(parts)).toBe(true);
    expect(parts.length).toBeGreaterThan(0);
    for (const p of parts) {
      expect(typeof p.value).toBe('string');
    }
  });

  it('produces no added/removed parts for identical input', () => {
    const html = '<div><span>hello</span></div>';
    const parts = computeHtmlDiff(html, html);
    expect(parts.some((p) => p.added)).toBe(false);
    expect(parts.some((p) => p.removed)).toBe(false);
  });

  it('treats differently-formatted but structurally-equal HTML as equal', () => {
    const minified = '<ul><li>a</li><li>b</li></ul>';
    const pretty = '<ul>\n  <li>a</li>\n  <li>b</li>\n</ul>';
    const parts = computeHtmlDiff(minified, pretty);
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('normalizes both sides to the same line structure', () => {
    // After normalize, both become:
    // <a>\n<b>x</b>\n</a>\n  -> so a no-change diff. Verify reconstructed text matches.
    const parts = computeHtmlDiff('<a> <b>x</b> </a>', '<a><b>x</b></a>');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
    expect(reconstructLeft(parts)).toBe(reconstructRight(parts));
  });

  it('reconstructs the normalized left input from non-added parts', () => {
    const left = '<a><b>x</b></a>';
    const right = '<a><b>y</b></a>';
    const parts = computeHtmlDiff(left, right);
    // normalize(left) = '<a>\n<b>x</b>\n</a>' then + '\n'
    expect(reconstructLeft(parts)).toBe('<a>\n<b>x</b>\n</a>\n');
  });

  it('reconstructs the normalized right input from non-removed parts', () => {
    const left = '<a><b>x</b></a>';
    const right = '<a><b>y</b></a>';
    const parts = computeHtmlDiff(left, right);
    expect(reconstructRight(parts)).toBe('<a>\n<b>y</b>\n</a>\n');
  });

  it('marks an added line when right has an extra element', () => {
    const left = '<ul><li>a</li></ul>';
    const right = '<ul><li>a</li><li>b</li></ul>';
    const parts = computeHtmlDiff(left, right);
    expect(parts.some((p) => p.added)).toBe(true);
    expect(addedText(parts)).toContain('<li>b</li>');
  });

  it('marks a removed line when right drops an element', () => {
    const left = '<ul><li>a</li><li>b</li></ul>';
    const right = '<ul><li>a</li></ul>';
    const parts = computeHtmlDiff(left, right);
    expect(parts.some((p) => p.removed)).toBe(true);
    expect(removedText(parts)).toContain('<li>b</li>');
  });

  it('handles two empty strings (only the trailing newline remains)', () => {
    const parts = computeHtmlDiff('', '');
    // normalize('') = '' then + '\n' -> both sides are '\n'
    expect(parts.some((p) => p.added)).toBe(false);
    expect(parts.some((p) => p.removed)).toBe(false);
    expect(reconstructLeft(parts)).toBe('\n');
  });

  it('handles whitespace-only input by trimming to empty', () => {
    const parts = computeHtmlDiff('   \n\t  ', '');
    // both normalize to '' + '\n' -> equal
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
    expect(reconstructLeft(parts)).toBe('\n');
  });

  it('detects content added to a previously empty document', () => {
    const parts = computeHtmlDiff('', '<p>hi</p>');
    expect(parts.some((p) => p.added)).toBe(true);
    expect(addedText(parts)).toContain('<p>hi</p>');
  });

  it('trims leading and trailing whitespace before diffing', () => {
    const parts = computeHtmlDiff('\n\n<p>x</p>\n\n', '<p>x</p>');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('collapses arbitrary whitespace (spaces, tabs, newlines) between tags', () => {
    const left = '<a>\t\n  <b></b>   </a>';
    const right = '<a><b></b></a>';
    const parts = computeHtmlDiff(left, right);
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
    // Note: '<b></b>' has a '><' boundary too, so it becomes '<b>\n</b>'.
    expect(reconstructLeft(parts)).toBe('<a>\n<b>\n</b>\n</a>\n');
  });

  it('preserves whitespace inside text nodes (does not collapse text content)', () => {
    // The regex only matches '>' ... '<' boundaries, so text whitespace stays.
    const left = '<p>hello   world</p>';
    const right = '<p>hello world</p>';
    const parts = computeHtmlDiff(left, right);
    // The inner spacing differs and is NOT normalized -> a change is detected.
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('handles unicode and emoji content', () => {
    const left = '<p>café 🚀</p>';
    const right = '<p>café 🚀</p>';
    const parts = computeHtmlDiff(left, right);
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
    expect(reconstructLeft(parts)).toContain('café 🚀');
  });

  it('detects emoji changes', () => {
    const parts = computeHtmlDiff('<p>🚀</p>', '<p>🌙</p>');
    expect(parts.some((p) => p.added || p.removed)).toBe(true);
  });

  it('handles special HTML entities and attribute characters', () => {
    const html = '<a href="x?a=1&amp;b=2" data-x="<>">link</a>';
    const parts = computeHtmlDiff(html, html);
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
  });

  it('handles large input deterministically and reconstructs both sides', () => {
    const rows = Array.from({ length: 500 }, (_, i) => `<li>${i}</li>`).join('');
    const left = `<ul>${rows}</ul>`;
    const right = `<ul>${rows}</ul>`;
    const parts = computeHtmlDiff(left, right);
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
    // Reconstructed normalized text should contain first and last items.
    expect(reconstructLeft(parts)).toContain('<li>0</li>');
    expect(reconstructLeft(parts)).toContain('<li>499</li>');
  });

  it('detects a single changed line within a large document', () => {
    const makeRows = (changed: string) =>
      Array.from({ length: 100 }, (_, i) => `<li>${i === 50 ? changed : i}</li>`).join('');
    const left = `<ul>${makeRows('50')}</ul>`;
    const right = `<ul>${makeRows('CHANGED')}</ul>`;
    const parts = computeHtmlDiff(left, right);
    expect(addedText(parts)).toContain('<li>CHANGED</li>');
    expect(removedText(parts)).toContain('<li>50</li>');
  });

  it('is deterministic across repeated calls', () => {
    const left = '<a><b>1</b><c>2</c></a>';
    const right = '<a><b>1</b><c>9</c></a>';
    const first = computeHtmlDiff(left, right);
    const second = computeHtmlDiff(left, right);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('handles input with no tags at all (plain text)', () => {
    const parts = computeHtmlDiff('just text', 'just text');
    expect(parts.every((p) => !p.added && !p.removed)).toBe(true);
    expect(reconstructLeft(parts)).toBe('just text\n');
  });

  it('detects plain-text changes', () => {
    const parts = computeHtmlDiff('foo', 'bar');
    expect(parts.some((p) => p.added)).toBe(true);
    expect(parts.some((p) => p.removed)).toBe(true);
  });

  it('swapping content from non-empty to empty yields only a removal', () => {
    const parts = computeHtmlDiff('<p>x</p>', '');
    expect(parts.some((p) => p.removed)).toBe(true);
    expect(removedText(parts)).toContain('<p>x</p>');
  });

  it('does not throw on malformed / unclosed HTML (it is a text diff, not a parser)', () => {
    expect(() => computeHtmlDiff('<div><span>', '<div>')).not.toThrow();
    const parts = computeHtmlDiff('<div><span>', '<div>');
    expect(Array.isArray(parts)).toBe(true);
  });

  it('full reconstruction: applying the diff turns left into right', () => {
    const left = '<a><b>1</b></a>';
    const right = '<a><b>2</b><c/></a>';
    const parts = computeHtmlDiff(left, right);
    expect(reconstructLeft(parts)).toBe('<a>\n<b>1</b>\n</a>\n');
    expect(reconstructRight(parts)).toBe('<a>\n<b>2</b>\n<c/>\n</a>\n');
  });
});
