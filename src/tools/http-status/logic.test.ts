import { describe, it, expect } from 'vitest';
import { httpStatusLogic } from './logic';

describe('httpStatus', () => {
  it('looks up an exact code', () => {
    expect(httpStatusLogic.transform('404')).toBe('404 Not Found');
  });
  it('searches by text', () => {
    expect(httpStatusLogic.transform('teapot')).toContain('418');
  });
  it('matches a code prefix', () => {
    expect(httpStatusLogic.transform('20').split('\n').length).toBeGreaterThan(1);
  });
  it('throws when nothing matches', () => {
    expect(() => httpStatusLogic.transform('zzzz')).toThrow();
  });
});
