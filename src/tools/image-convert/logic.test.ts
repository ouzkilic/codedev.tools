import { describe, expect, it } from 'vitest';
import { extFor, mimeFor } from './logic';

describe('mimeFor', () => {
  it('maps jpeg to image/jpeg', () => {
    expect(mimeFor('jpeg')).toBe('image/jpeg');
  });

  it('maps jpg to image/jpeg', () => {
    expect(mimeFor('jpg')).toBe('image/jpeg');
  });

  it('maps webp to image/webp', () => {
    expect(mimeFor('webp')).toBe('image/webp');
  });

  it('maps png to image/png', () => {
    expect(mimeFor('png')).toBe('image/png');
  });

  it('defaults unknown formats to image/png', () => {
    expect(mimeFor('x')).toBe('image/png');
  });
});

describe('extFor', () => {
  it('returns png for png', () => {
    expect(extFor('png')).toBe('png');
  });

  it('returns jpeg for jpeg and jpg', () => {
    expect(extFor('jpeg')).toBe('jpeg');
    expect(extFor('jpg')).toBe('jpeg');
  });

  it('returns webp for webp', () => {
    expect(extFor('webp')).toBe('webp');
  });

  it('falls back to png for empty input', () => {
    expect(extFor('')).toBe('png');
  });
});
