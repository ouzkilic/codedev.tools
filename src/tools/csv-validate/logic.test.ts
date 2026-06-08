import { describe, expect, it } from 'vitest';
import { csvValidateLogic } from './logic';

describe('csvValidateLogic', () => {
  it('reports rows and columns for valid CSV', () => {
    const out = csvValidateLogic.transform('a,b\n1,2', { options: {}, secondary: '' });
    expect(out).toContain('✓');
    expect(out).toContain('Rows: 2');
    expect(out).toContain('Columns: 2');
  });

  it('reports single column', () => {
    const out = csvValidateLogic.transform('x\n1', { options: {}, secondary: '' });
    expect(out).toContain('Columns: 1');
  });
});
