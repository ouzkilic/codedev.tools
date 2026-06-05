import { describe, it, expect } from 'vitest';
import { envToJsonLogic } from './logic';

const toObj = (s: string) => JSON.parse(envToJsonLogic.transform(s));

describe('envToJson', () => {
  it('parses KEY=VALUE pairs', () => {
    expect(toObj('A=1\nB=hello')).toEqual({ A: '1', B: 'hello' });
  });
  it('skips comments and blank lines', () => {
    expect(toObj('# comment\n\nA=1')).toEqual({ A: '1' });
  });
  it('strips surrounding quotes', () => {
    expect(toObj('A="hello world"\nB=\'x\'')).toEqual({ A: 'hello world', B: 'x' });
  });
  it('drops an export prefix', () => {
    expect(toObj('export A=1')).toEqual({ A: '1' });
  });
});
