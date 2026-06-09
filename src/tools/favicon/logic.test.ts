import { describe, it, expect } from 'vitest';
import { FAVICON_SIZES, linkTags } from './logic';

describe('favicon logic', () => {
  describe('FAVICON_SIZES', () => {
    it('includes standard sizes', () => {
      expect(FAVICON_SIZES).toContain(16);
      expect(FAVICON_SIZES).toContain(32);
      expect(FAVICON_SIZES).toContain(180);
    });

    it('contains exactly the expected sizes in order', () => {
      expect(FAVICON_SIZES).toEqual([16, 32, 48, 180]);
    });

    it('has four entries', () => {
      expect(FAVICON_SIZES).toHaveLength(4);
    });

    it('contains only positive integers', () => {
      for (const size of FAVICON_SIZES) {
        expect(Number.isInteger(size)).toBe(true);
        expect(size).toBeGreaterThan(0);
      }
    });

    it('has no duplicate sizes', () => {
      expect(new Set(FAVICON_SIZES).size).toBe(FAVICON_SIZES.length);
    });

    it('is sorted ascending', () => {
      const sorted = [...FAVICON_SIZES].sort((a, b) => a - b);
      expect(FAVICON_SIZES).toEqual(sorted);
    });

    it('includes the apple-touch-icon size 180', () => {
      expect(FAVICON_SIZES[FAVICON_SIZES.length - 1]).toBe(180);
    });

    it('starts at the smallest size 16', () => {
      expect(Math.min(...FAVICON_SIZES)).toBe(16);
    });
  });

  describe('linkTags', () => {
    it('returns a non-empty string', () => {
      const tags = linkTags();
      expect(typeof tags).toBe('string');
      expect(tags.length).toBeGreaterThan(0);
    });

    it('produces recommended link tags', () => {
      const tags = linkTags();
      expect(tags).toContain('rel="icon"');
      expect(tags).toContain('apple-touch-icon');
      expect(tags).toContain('32x32');
    });

    it('emits exactly three link lines', () => {
      const tags = linkTags();
      const lines = tags.split('\n');
      expect(lines).toHaveLength(3);
      for (const line of lines) {
        expect(line).toMatch(/^<link /);
        expect(line).toMatch(/>$/);
      }
    });

    it('joins lines with a single newline (no trailing newline)', () => {
      const tags = linkTags();
      expect(tags.startsWith('\n')).toBe(false);
      expect(tags.endsWith('\n')).toBe(false);
      expect(tags).not.toContain('\n\n');
    });

    it('includes the 16x16 png icon link with correct href', () => {
      const tags = linkTags();
      expect(tags).toContain(
        '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
      );
    });

    it('includes the 32x32 png icon link with correct href', () => {
      const tags = linkTags();
      expect(tags).toContain(
        '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
      );
    });

    it('includes the 180x180 apple-touch-icon link with correct href', () => {
      const tags = linkTags();
      expect(tags).toContain(
        '<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">',
      );
    });

    it('returns the full expected markup verbatim', () => {
      const expected = [
        '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
        '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
        '<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">',
      ].join('\n');
      expect(linkTags()).toBe(expected);
    });

    it('uses image/png type only for the two standard icons', () => {
      const tags = linkTags();
      const pngMatches = tags.match(/type="image\/png"/g);
      expect(pngMatches).toHaveLength(2);
    });

    it('references only root-relative absolute hrefs', () => {
      const tags = linkTags();
      const hrefs = [...tags.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs).toHaveLength(3);
      for (const href of hrefs) {
        expect(href.startsWith('/')).toBe(true);
        expect(href).toMatch(/\.png$/);
      }
    });

    it('is deterministic across repeated calls', () => {
      expect(linkTags()).toBe(linkTags());
    });

    it('takes no arguments and ignores extras', () => {
      expect(linkTags.length).toBe(0);
      // Calling with extra args (cast through unknown) yields identical output.
      const fn = linkTags as (...args: unknown[]) => string;
      expect(fn('ignored', 42)).toBe(linkTags());
    });

    it('references a png href for each non-48 favicon size', () => {
      const tags = linkTags();
      // 48 is in FAVICON_SIZES but has no link tag; the rest do.
      for (const size of FAVICON_SIZES) {
        if (size === 48) {
          expect(tags).not.toContain(`favicon-${size}x${size}.png`);
        } else {
          expect(tags).toContain(`favicon-${size}x${size}.png`);
        }
      }
    });
  });
});
