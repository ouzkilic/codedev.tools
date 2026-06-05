import { describe, it, expect } from 'vitest';
import { htmlEntitiesLogic } from './logic';

const enc = (s: string) => htmlEntitiesLogic.transform(s, { options: { mode: 'encode' }, secondary: '' });
const dec = (s: string) => htmlEntitiesLogic.transform(s, { options: { mode: 'decode' }, secondary: '' });

describe('htmlEntities', () => {
  it('escapes the five special characters', () => {
    expect(enc('<div class="x">a & b</div>')).toBe('&lt;div class=&quot;x&quot;&gt;a &amp; b&lt;/div&gt;');
  });
  it('unescapes named entities', () => {
    expect(dec('&lt;a&gt; &amp; &quot;b&quot;')).toBe('<a> & "b"');
  });
  it('unescapes decimal and hex numeric entities', () => {
    expect(dec('&#65;&#x42;')).toBe('AB');
  });
  it('round-trips escape → unescape', () => {
    const raw = '<p title="x & y">\'quote\'</p>';
    expect(dec(enc(raw))).toBe(raw);
  });
});
