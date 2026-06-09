import { describe, it, expect } from 'vitest';
import { jsonToPropertiesLogic } from './logic';

const transform = (input: string) => jsonToPropertiesLogic.transform(input);

describe('jsonToPropertiesLogic', () => {
  describe('happy paths', () => {
    it('converts flat object', () => {
      expect(transform('{"a":1,"b":"x"}')).toBe('a=1\nb=x');
    });

    it('dots nested object keys', () => {
      expect(transform('{"x":{"y":1}}')).toBe('x.y=1');
    });

    it('handles deeply nested keys', () => {
      expect(transform('{"a":{"b":{"c":true}}}')).toBe('a.b.c=true');
    });

    it('uses dotted index keys for arrays', () => {
      expect(transform('{"list":[10,20]}')).toBe('list.0=10\nlist.1=20');
    });

    it('preserves insertion order of keys', () => {
      expect(transform('{"z":1,"a":2,"m":3}')).toBe('z=1\na=2\nm=3');
    });

    it('flattens arrays of objects with combined dotted keys', () => {
      expect(transform('{"users":[{"name":"a"},{"name":"b"}]}')).toBe(
        'users.0.name=a\nusers.1.name=b',
      );
    });

    it('flattens nested arrays with chained indices', () => {
      expect(transform('{"m":[[1,2],[3]]}')).toBe('m.0.0=1\nm.0.1=2\nm.1.0=3');
    });

    it('mixes objects and arrays at multiple levels', () => {
      expect(transform('{"a":{"b":[{"c":1}]}}')).toBe('a.b.0.c=1');
    });
  });

  describe('primitive value stringification', () => {
    it('stringifies booleans', () => {
      expect(transform('{"t":true,"f":false}')).toBe('t=true\nf=false');
    });

    it('stringifies null as the literal "null"', () => {
      expect(transform('{"n":null}')).toBe('n=null');
    });

    it('stringifies zero and negative numbers', () => {
      expect(transform('{"z":0,"neg":-42}')).toBe('z=0\nneg=-42');
    });

    it('stringifies floating point numbers', () => {
      expect(transform('{"pi":3.14}')).toBe('pi=3.14');
    });

    it('stringifies large numbers via String()', () => {
      // 1e21 stringifies to exponential form in JS
      expect(transform('{"big":1e21}')).toBe('big=1e+21');
    });

    it('keeps empty string values (key with trailing =)', () => {
      expect(transform('{"empty":""}')).toBe('empty=');
    });
  });

  describe('keys and string content edge cases', () => {
    it('preserves dots already present in keys', () => {
      expect(transform('{"a.b":1}')).toBe('a.b=1');
    });

    it('preserves spaces in keys and values', () => {
      expect(transform('{"my key":"my value"}')).toBe('my key=my value');
    });

    it('preserves unicode and emoji in values', () => {
      expect(transform('{"greet":"héllo 👋 世界"}')).toBe('greet=héllo 👋 世界');
    });

    it('preserves equals signs inside values', () => {
      expect(transform('{"eq":"a=b=c"}')).toBe('eq=a=b=c');
    });

    it('keeps a newline embedded in a string value literally', () => {
      // JSON \n decodes to a real newline inside the value
      expect(transform('{"k":"line1\\nline2"}')).toBe('k=line1\nline2');
    });

    it('handles empty-string keys', () => {
      expect(transform('{"":5}')).toBe('=5');
    });
  });

  describe('empty / collapsing structures', () => {
    it('returns empty string for an empty object', () => {
      expect(transform('{}')).toBe('');
    });

    it('returns empty string when a value is an empty object', () => {
      expect(transform('{"a":{}}')).toBe('');
    });

    it('returns empty string when a value is an empty array', () => {
      expect(transform('{"a":[]}')).toBe('');
    });

    it('omits empty branches but keeps populated ones', () => {
      expect(transform('{"a":{},"b":2}')).toBe('b=2');
    });
  });

  describe('whitespace handling', () => {
    it('parses input with surrounding whitespace (JSON.parse tolerates it)', () => {
      expect(transform('  {"a":1}  ')).toBe('a=1');
    });

    it('ignores formatting whitespace inside JSON', () => {
      expect(transform('{\n  "a": 1,\n  "b": 2\n}')).toBe('a=1\nb=2');
    });
  });

  describe('error paths', () => {
    it('throws on a top-level array', () => {
      expect(() => transform('[1,2]')).toThrow('Input must be a JSON object');
    });

    it('throws on top-level null', () => {
      expect(() => transform('null')).toThrow('Input must be a JSON object');
    });

    it('throws on a top-level number primitive', () => {
      expect(() => transform('123')).toThrow('Input must be a JSON object');
    });

    it('throws on a top-level string primitive', () => {
      expect(() => transform('"hello"')).toThrow('Input must be a JSON object');
    });

    it('throws on a top-level boolean primitive', () => {
      expect(() => transform('true')).toThrow('Input must be a JSON object');
    });

    it('throws on invalid JSON', () => {
      expect(() => transform('{not json')).toThrow('Invalid JSON input');
    });

    it('throws on empty input', () => {
      expect(() => transform('')).toThrow('Invalid JSON input');
    });

    it('throws on whitespace-only input', () => {
      expect(() => transform('   ')).toThrow('Invalid JSON input');
    });

    it('attaches the original parse error as cause', () => {
      try {
        transform('{bad');
        throw new Error('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Invalid JSON input');
        expect((e as Error).cause).toBeInstanceOf(Error);
      }
    });
  });

  describe('determinism / scale', () => {
    it('is deterministic for the same input', () => {
      const input = '{"a":{"b":1},"c":[1,2,3]}';
      expect(transform(input)).toBe(transform(input));
    });

    it('handles a large flat object producing one line per key', () => {
      const entries: Record<string, number> = {};
      for (let i = 0; i < 500; i++) entries[`k${i}`] = i;
      const out = transform(JSON.stringify(entries));
      const lines = out.split('\n');
      expect(lines).toHaveLength(500);
      expect(lines[0]).toBe('k0=0');
      expect(lines[499]).toBe('k499=499');
    });

    it('handles a large array producing indexed lines', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i * 2);
      const out = transform(JSON.stringify({ nums: arr }));
      const lines = out.split('\n');
      expect(lines).toHaveLength(100);
      expect(lines[0]).toBe('nums.0=0');
      expect(lines[99]).toBe('nums.99=198');
    });
  });
});
