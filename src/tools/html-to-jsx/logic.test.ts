import { describe, it, expect } from 'vitest';
import { htmlToJsxLogic } from './logic';

describe('htmlToJsxLogic', () => {
  it('converts class to className', () => {
    expect(htmlToJsxLogic.transform('<div class="x">')).toBe(
      '<div className="x">',
    );
  });

  it('converts for to htmlFor', () => {
    expect(htmlToJsxLogic.transform('<label for="y">z</label>')).toBe(
      '<label htmlFor="y">z</label>',
    );
  });

  it('self-closes void elements', () => {
    expect(htmlToJsxLogic.transform('<br>')).toBe('<br />');
  });

  it('converts HTML comments to JSX comments', () => {
    expect(htmlToJsxLogic.transform('<!-- c -->')).toBe('{/* c */}');
  });

  it('does not double self-close already closed void elements', () => {
    expect(htmlToJsxLogic.transform('<br />')).toBe('<br />');
  });
});
