import { describe, it, expect } from 'vitest';
import { mimeTypesLogic } from './logic';

describe('mimeTypes', () => {
  it('looks up by extension', () => {
    expect(mimeTypesLogic.transform('json')).toBe('.json → application/json');
  });
  it('ignores a leading dot', () => {
    expect(mimeTypesLogic.transform('.png')).toBe('.png → image/png');
  });
  it('searches by mime substring', () => {
    expect(mimeTypesLogic.transform('image/')).toContain('image/');
  });
  it('throws when nothing matches', () => {
    expect(() => mimeTypesLogic.transform('zzz')).toThrow();
  });
});
