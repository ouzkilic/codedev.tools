import { describe, it, expect } from 'vitest';
import { buildRegex } from './logic';

describe('buildRegex', () => {
  it('returns full list when filter is empty', () => {
    const out = buildRegex({ filter: '' });
    expect(out).toContain('digit');
    expect(out).toContain('\\d');
    expect(out).toContain('\\b');
  });

  it('filters by word boundary', () => {
    const out = buildRegex({ filter: 'word boundary' });
    expect(out).toContain('\\b  word boundary');
    expect(out).not.toContain('any char');
  });

  it('filters by digit', () => {
    const out = buildRegex({ filter: 'digit' });
    expect(out).toContain('\\d');
  });
});
