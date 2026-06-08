import { describe, expect, it } from 'vitest';
import { asciiArtLogic } from './logic';

describe('asciiArtLogic', () => {
  it('renders text as a multi-line ASCII banner', async () => {
    const out = await asciiArtLogic.transform('Hi', { options: {}, secondary: '' });
    expect(out).toContain('\n');
    expect(out.length).toBeGreaterThan(5);
  });
});
