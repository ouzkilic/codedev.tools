import { describe, expect, it } from 'vitest';
import { cssMinifyLogic } from './logic';

describe('cssMinifyLogic', () => {
  it('minifies basic css', () => {
    expect(cssMinifyLogic.transform('a { color: red; }', { options: {}, secondary: '' })).toBe('a{color:red}');
  });

  it('removes comments and trailing semicolon', () => {
    expect(cssMinifyLogic.transform('/* c */ b { margin : 0 ; }', { options: {}, secondary: '' })).toBe('b{margin:0}');
  });

  it('handles selectors with commas', () => {
    expect(cssMinifyLogic.transform('a,b { x:1 }', { options: {}, secondary: '' })).toBe('a,b{x:1}');
  });
});
