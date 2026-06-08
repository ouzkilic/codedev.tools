import { describe, it, expect } from 'vitest';
import { invisibleCharsLogic } from './logic';

describe('invisibleCharsLogic', () => {
  it('removes a zero-width space', () => {
    expect(invisibleCharsLogic.transform('a​b')).toBe('ab');
  });

  it('removes a BOM/zero-width no-break space', () => {
    expect(invisibleCharsLogic.transform('x﻿y')).toBe('xy');
  });

  it('leaves plain text unchanged', () => {
    expect(invisibleCharsLogic.transform('hello')).toBe('hello');
  });

  it('reduces a string of only zero-width chars to empty', () => {
    expect(invisibleCharsLogic.transform('​‌‍⁠')).toBe('');
  });

  it('removes a soft hyphen', () => {
    expect(invisibleCharsLogic.transform('co­op')).toBe('coop');
  });
});
