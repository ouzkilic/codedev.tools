import { describe, it, expect } from 'vitest';
import { csvToYamlLogic } from './logic';

describe('csvToYamlLogic', () => {
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

  it('coerces numeric and boolean values via dynamicTyping', () => {
    const out = csvToYamlLogic.transform('name,active\nAda,true');
    expect(out).toContain('active: true');
  });

  it('ignores the single-column Delimiter warning', () => {
    const out = csvToYamlLogic.transform('name\nAda\nBob');
    expect(out).toContain('- name: Ada');
    expect(out).toContain('- name: Bob');
  });

  it('handles quoted values containing commas', () => {
    const out = csvToYamlLogic.transform('name,city\nAda,"London, UK"');
    expect(out).toContain('city: London, UK');
  });
});
