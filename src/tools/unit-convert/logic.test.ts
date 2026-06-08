import { describe, it, expect } from 'vitest';
import { unitConvertLogic } from './logic';

function run(input: string, from: string, to: string): string {
  return unitConvertLogic.transform(input, { options: { from, to }, secondary: '' });
}

describe('unitConvertLogic', () => {
  it('converts meters to kilometers', () => {
    expect(run('1000', 'm', 'km')).toBe('1');
  });

  it('converts kilometers to miles', () => {
    expect(run('1', 'km', 'mi')).toBe('0.621371');
  });

  it('converts 0 celsius to fahrenheit', () => {
    expect(run('0', 'c', 'f')).toBe('32');
  });

  it('converts 100 celsius to fahrenheit', () => {
    expect(run('100', 'c', 'f')).toBe('212');
  });

  it('throws converting across unit types', () => {
    expect(() => run('5', 'm', 'kg')).toThrow('Cannot convert between different unit types.');
  });

  it('throws on invalid number', () => {
    expect(() => run('abc', 'm', 'km')).toThrow();
  });
});
