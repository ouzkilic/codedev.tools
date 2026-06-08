import { describe, expect, it } from 'vitest';
import { buildPalette } from './logic';

describe('buildPalette', () => {
  it('returns the requested number of valid hex colors', () => {
    const lines = buildPalette({ count: '5' }).split('\n');
    expect(lines).toHaveLength(5);
    for (const line of lines) {
      expect(line).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('clamps count of 0 up to 1', () => {
    const lines = buildPalette({ count: '0' }).split('\n');
    expect(lines).toHaveLength(1);
  });
});
