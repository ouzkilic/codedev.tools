import { describe, it, expect } from 'vitest';
import { jsonToTypesLogic } from './logic';

describe('jsonToTypesLogic', () => {
  it('generates Go types', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', {
      options: { lang: 'go' },
      secondary: '',
    });
    expect(out).toContain('type Root struct');
  });

  it('generates TypeScript types', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', {
      options: { lang: 'typescript' },
      secondary: '',
    });
    expect(out).toContain('interface Root');
  });
});
