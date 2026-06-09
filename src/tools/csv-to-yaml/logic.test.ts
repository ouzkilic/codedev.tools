import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { csvToYamlLogic } from './logic';

describe('csvToYamlLogic', () => {
  // --- happy paths ---
  it('converts a single row into a YAML list item', () => {
    const out = csvToYamlLogic.transform('name,age\nAda,36');
    expect(out).toContain('- name: Ada');
    expect(out).toContain('age: 36');
  });

  it('produces two list items for two rows', () => {
    const out = csvToYamlLogic.transform('name,age\nAda,36\nBob,40');
    const items = out.split('\n').filter((line) => line.startsWith('- '));
    expect(items).toHaveLength(2);
    expect(out).toContain('- name: Ada');
    expect(out).toContain('- name: Bob');
  });

  it('emits an exact two-key block for a single row', () => {
    const out = csvToYamlLogic.transform('name,age\nAda,36');
    expect(out).toBe('- name: Ada\n  age: 36\n');
  });

  // --- dynamicTyping branches ---
  it('coerces boolean values via dynamicTyping', () => {
    const out = csvToYamlLogic.transform('name,active\nAda,true');
    expect(out).toContain('active: true');
  });

  it('coerces integers via dynamicTyping (no quotes)', () => {
    const out = csvToYamlLogic.transform('count\n42');
    expect(out).toContain('count: 42');
    expect(out).not.toContain("'42'");
  });

  it('coerces floats via dynamicTyping', () => {
    const out = csvToYamlLogic.transform('ratio\n3.14');
    expect(out).toContain('ratio: 3.14');
  });

  it('handles negative numbers and zero as numeric scalars', () => {
    const out = csvToYamlLogic.transform('n\n-5\n0\n3.14');
    expect(out).toBe("- 'n': -5\n- 'n': 0\n- 'n': 3.14\n");
  });

  it('strips a leading zero from a numeric-looking string (dynamicTyping)', () => {
    // "007" is parsed as the number 7, losing the leading zeros.
    const out = csvToYamlLogic.transform('code\n007');
    expect(out).toBe('- code: 7\n');
  });

  // --- empty / whitespace input ---
  it('returns an empty YAML sequence for an empty string', () => {
    expect(csvToYamlLogic.transform('')).toBe('[]\n');
  });

  it('returns an empty YAML sequence for whitespace-only input', () => {
    expect(csvToYamlLogic.transform('   \n  ')).toBe('[]\n');
  });

  it('returns an empty YAML sequence when only a header row is present', () => {
    expect(csvToYamlLogic.transform('name,age')).toBe('[]\n');
  });

  it('trims trailing blank lines (skipEmptyLines)', () => {
    const out = csvToYamlLogic.transform('a,b\n1,2\n\n');
    expect(out).toBe('- a: 1\n  b: 2\n');
  });

  // --- Delimiter warning is non-fatal ---
  it('ignores the single-column Delimiter warning', () => {
    const out = csvToYamlLogic.transform('name\nAda\nBob');
    expect(out).toBe('- name: Ada\n- name: Bob\n');
  });

  // --- quoting / special characters ---
  it('handles quoted values containing commas', () => {
    const out = csvToYamlLogic.transform('name,city\nAda,"London, UK"');
    expect(out).toContain('city: London, UK');
  });

  it('quotes values that look like YAML mappings to keep them strings', () => {
    // "yes: no" must be quoted so it round-trips as a string, not a nested map.
    const out = csvToYamlLogic.transform('key,val\na,"yes: no"');
    expect(out).toBe("- key: a\n  val: 'yes: no'\n");
  });

  it('preserves leading/trailing whitespace inside quoted fields (quoted scalar)', () => {
    const out = csvToYamlLogic.transform('a\n"  x  "');
    expect(out).toBe("- a: '  x  '\n");
  });

  it('emits null for an empty quoted field', () => {
    const out = csvToYamlLogic.transform('a,b\n"",x');
    expect(out).toBe('- a: null\n  b: x\n');
  });

  it('preserves unicode and emoji characters', () => {
    const out = csvToYamlLogic.transform('name,note\nAda,"hello 😀 world"');
    expect(out).toContain('note: hello 😀 world');
  });

  // --- error paths ---
  it('throws when a row has too few fields', () => {
    expect(() => csvToYamlLogic.transform('a,b,c\n1,2')).toThrow(/Too few fields/);
  });

  it('throws with a 1-based row number in the message', () => {
    expect(() => csvToYamlLogic.transform('a,b,c\n1,2')).toThrow(/row 1/);
  });

  it('throws when a row has too many fields', () => {
    expect(() => csvToYamlLogic.transform('a,b\n1,2,3')).toThrow(/Too many fields/);
  });

  it('throws on an unterminated quoted field', () => {
    expect(() => csvToYamlLogic.transform('a,b\n"x,y')).toThrow(/unterminated/i);
  });

  // --- round-trip / determinism / scale ---
  it('round-trips through YAML back to the typed row objects', () => {
    const out = csvToYamlLogic.transform('a,b\n1,2\n3,4');
    expect(yaml.load(out)).toEqual([
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]);
  });

  it('is deterministic across repeated calls', () => {
    const input = 'a,b\n1,2\n3,4';
    expect(csvToYamlLogic.transform(input)).toBe(csvToYamlLogic.transform(input));
  });

  it('handles a large input producing one item per row', () => {
    let csv = 'id,val\n';
    for (let i = 0; i < 1000; i++) csv += `${i},v${i}\n`;
    const out = csvToYamlLogic.transform(csv);
    const matches = out.match(/- id:/g);
    expect(matches).toHaveLength(1000);
    expect(out).toContain('- id: 0');
    expect(out).toContain('- id: 999');
  });
});
