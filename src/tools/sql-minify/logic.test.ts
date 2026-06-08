import { describe, expect, it } from 'vitest';
import { sqlMinifyLogic } from './logic';

describe('sqlMinifyLogic', () => {
  it('removes line comments and collapses newlines', () => {
    expect(sqlMinifyLogic.transform('SELECT *\nFROM t -- comment', { options: {}, secondary: '' })).toBe('SELECT * FROM t');
  });

  it('removes block comments', () => {
    expect(sqlMinifyLogic.transform('SELECT /* x */ 1', { options: {}, secondary: '' })).toBe('SELECT 1');
  });

  it('collapses multiple spaces and newlines', () => {
    expect(sqlMinifyLogic.transform('SELECT   a,\n\n  b\nFROM   t', { options: {}, secondary: '' })).toBe('SELECT a, b FROM t');
  });
});
