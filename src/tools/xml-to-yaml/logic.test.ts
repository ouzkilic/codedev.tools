import { describe, it, expect } from 'vitest';
import { xmlToYamlLogic } from './logic';

describe('xmlToYamlLogic', () => {
  it('converts XML to YAML', () => {
    const out = xmlToYamlLogic.transform('<r><a>1</a></r>', { options: {}, secondary: '' });
    expect(out).toContain('r:');
    expect(out).toContain('a:');
  });

  it('throws on invalid XML', () => {
    expect(() => xmlToYamlLogic.transform('<a></b>', { options: {}, secondary: '' })).toThrow();
  });
});
