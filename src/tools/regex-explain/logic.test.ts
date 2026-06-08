import { describe, it, expect } from 'vitest';
import { regexExplainLogic, explainRegex } from './logic';

const run = (input: string) => regexExplainLogic.transform(input, { options: {}, secondary: '' });

describe('regexExplainLogic', () => {
  it('explains \\d+ with digit and one or more', () => {
    const out = run('\\d+');
    expect(out).toContain('digit');
    expect(out).toContain('one or more');
  });

  it('explains ^abc$ with start and end', () => {
    const out = run('^abc$');
    expect(out).toContain('start');
    expect(out).toContain('end');
  });

  it('explains [a-z] as a set', () => {
    expect(run('[a-z]')).toContain('set');
  });

  it('explains (foo|bar) with group and alternation', () => {
    const out = run('(foo|bar)');
    expect(out).toContain('group');
    expect(out).toContain('alternation');
  });

  it('explains negated set [^0-9]', () => {
    expect(run('[^0-9]')).toContain('negated');
  });

  it('explains non-capturing group (?:x)', () => {
    expect(run('(?:x)')).toContain('non-capturing');
  });

  it('explains escaped literal dot \\.', () => {
    expect(run('\\.')).toContain('literal "."');
  });

  it('explains quantifiers {2} and {1,3}', () => {
    expect(run('a{2}')).toContain('exactly 2');
    expect(run('a{1,3}')).toContain('1 to 3');
  });

  it('explains unknown single char as a literal', () => {
    expect(run('z')).toContain('literal "z"');
  });

  it('throws on empty input', () => {
    expect(() => run('')).toThrow();
    expect(() => run('   ')).toThrow();
  });

  it('exposes explainRegex helper returning token pairs', () => {
    const tokens = explainRegex('a+');
    expect(tokens).toHaveLength(2);
    expect(tokens[1]).toEqual({ token: '+', explanation: 'one or more' });
  });
});
