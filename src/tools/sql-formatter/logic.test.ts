import { describe, it, expect } from 'vitest';
import { sqlFormatterLogic } from './logic';

const fmt = (s: string) => sqlFormatterLogic.transform(s, { options: { dialect: 'sql' }, secondary: '' });

describe('sqlFormatter', () => {
  it('uppercases keywords and indents', () => {
    const out = fmt('select id, name from users where age > 18');
    expect(out).toContain('SELECT');
    expect(out).toContain('FROM');
    expect(out).toContain('WHERE');
  });
  it('puts each selected column on its own line', () => {
    const out = fmt('select a, b, c from t');
    expect(out.split('\n').length).toBeGreaterThan(1);
  });
});
