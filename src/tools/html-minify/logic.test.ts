import { describe, it, expect } from 'vitest';
import { htmlMinifyLogic } from './logic';

describe('htmlMinifyLogic', () => {
  it('collapses whitespace between tags', () => {
    expect(
      htmlMinifyLogic.transform('<div>  <p>Hi</p>  </div>', { options: {}, secondary: '' }),
    ).toBe('<div><p>Hi</p></div>');
  });

  it('removes HTML comments', () => {
    expect(
      htmlMinifyLogic.transform('<!-- c --><b>x</b>', { options: {}, secondary: '' }),
    ).toBe('<b>x</b>');
  });

  it('preserves single spaces inside text', () => {
    expect(
      htmlMinifyLogic.transform('<p>a b</p>', { options: {}, secondary: '' }),
    ).toBe('<p>a b</p>');
  });
});
