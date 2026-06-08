import { describe, expect, it } from 'vitest';
import { highlightLogic } from './logic';

describe('highlightLogic', () => {
  it('highlights JavaScript keywords', async () => {
    expect(
      await highlightLogic.transform('const x = 1;', { options: { language: 'javascript' }, secondary: '' }),
    ).toContain('hljs-keyword');
  });

  it('highlights JSON input', async () => {
    expect(
      await highlightLogic.transform('{"a": 1}', { options: { language: 'json' }, secondary: '' }),
    ).toContain('hljs');
  });
});
