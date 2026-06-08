import { describe, it, expect } from 'vitest';
import { FAVICON_SIZES, linkTags } from './logic';

describe('favicon logic', () => {
  it('includes standard sizes', () => {
    expect(FAVICON_SIZES).toContain(16);
    expect(FAVICON_SIZES).toContain(32);
    expect(FAVICON_SIZES).toContain(180);
  });

  it('produces recommended link tags', () => {
    const tags = linkTags();
    expect(tags).toContain('rel="icon"');
    expect(tags).toContain('apple-touch-icon');
    expect(tags).toContain('32x32');
  });
});
