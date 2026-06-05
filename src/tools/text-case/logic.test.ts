import { describe, it, expect } from 'vitest';
import { textCaseLogic } from './logic';

const to = (target: string) => (s: string) =>
  textCaseLogic.transform(s, { options: { target }, secondary: '' });

describe('textCase', () => {
  it('converts to camelCase', () => {
    expect(to('camel')('hello world')).toBe('helloWorld');
  });
  it('converts to PascalCase', () => {
    expect(to('pascal')('hello world')).toBe('HelloWorld');
  });
  it('converts to snake_case', () => {
    expect(to('snake')('Hello World')).toBe('hello_world');
  });
  it('converts to kebab-case', () => {
    expect(to('kebab')('Hello World')).toBe('hello-world');
  });
  it('converts to CONSTANT_CASE', () => {
    expect(to('constant')('hello world')).toBe('HELLO_WORLD');
  });
  it('splits an existing camelCase identifier', () => {
    expect(to('snake')('helloWorldFoo')).toBe('hello_world_foo');
  });
  it('title-cases a sentence', () => {
    expect(to('title')('the quick brown fox')).toBe('The Quick Brown Fox');
  });
});
