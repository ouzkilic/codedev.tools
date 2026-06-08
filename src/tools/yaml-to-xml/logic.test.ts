import { describe, it, expect } from 'vitest';
import { yamlToXmlLogic } from './logic';

describe('yamlToXml', () => {
  it('builds XML from a YAML mapping', () => {
    const out = yamlToXmlLogic.transform('r:\n  a: hi');
    expect(out).toContain('<r>');
    expect(out).toContain('<a>hi</a>');
  });
  it('throws on a top-level list', () => {
    expect(() => yamlToXmlLogic.transform('- a\n- b')).toThrow();
  });
});
