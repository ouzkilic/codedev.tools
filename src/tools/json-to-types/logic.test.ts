import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { jsonToTypesLogic } from './logic';

/** Helper: build a ToolContext with the given lang (omit to exercise the default). */
function ctx(lang?: string): ToolContext {
  return {
    options: lang === undefined ? {} : { lang },
    secondary: '',
  };
}

const SAMPLE = '{"id":1,"name":"Ada","tags":["a","b"],"active":true,"score":3.5,"meta":{"x":1}}';

describe('jsonToTypesLogic — options metadata', () => {
  it('exposes a single select option keyed "lang" defaulting to go', () => {
    const opts = jsonToTypesLogic.options;
    expect(opts).toBeDefined();
    expect(opts).toHaveLength(1);
    const lang = opts![0];
    expect(lang.key).toBe('lang');
    expect(lang.type).toBe('select');
    expect(lang.default).toBe('go');
  });

  it('lists all 11 supported languages as choices', () => {
    const choices = jsonToTypesLogic.options![0].choices!;
    const values = choices.map((c) => c.value);
    expect(values).toEqual([
      'typescript',
      'go',
      'rust',
      'java',
      'csharp',
      'python',
      'swift',
      'kotlin',
      'dart',
      'php',
      'cpp',
    ]);
  });
});

describe('jsonToTypesLogic — per-language happy paths', () => {
  it('generates Go types', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('go'));
    expect(out).toContain('type Root struct');
    expect(out).toContain('`json:"id"`');
    expect(out).toContain('`json:"name"`');
  });

  it('generates TypeScript types', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('typescript'));
    expect(out).toContain('interface Root');
    expect(out).toContain('id:');
    expect(out).toContain('name:');
  });

  it('generates Rust structs with serde derive', async () => {
    const out = await jsonToTypesLogic.transform(SAMPLE, ctx('rust'));
    expect(out).toContain('pub struct Root');
    expect(out).toContain('use serde::{Serialize, Deserialize}');
  });

  it('generates Java class with getters/setters', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('java'));
    expect(out).toContain('public class Root');
    expect(out).toContain('public long getID()');
    expect(out).toContain('public String getName()');
  });

  it('generates C# partial class with JsonProperty attributes', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('csharp'));
    expect(out).toContain('public partial class Root');
    expect(out).toContain('[JsonProperty("id")]');
    expect(out).toContain('public long Id');
  });

  it('generates Python class with type annotations and __init__', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('python'));
    expect(out).toContain('class Root:');
    expect(out).toContain('def __init__(');
    expect(out).toMatch(/id:\s*int/);
    expect(out).toMatch(/name:\s*str/);
  });

  it('generates Swift struct importing Foundation', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('swift'));
    expect(out).toContain('struct Root');
    expect(out).toContain('import Foundation');
    expect(out).toContain('let id: Int');
  });

  it('generates Kotlin data class', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('kotlin'));
    expect(out).toContain('data class Root');
    expect(out).toContain('val id: Long');
    expect(out).toContain('val name: String');
  });

  it('generates Dart class with named constructor', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('dart'));
    expect(out).toContain('class Root');
    expect(out).toContain('int id;');
    expect(out).toContain('required this.id');
  });

  it('generates PHP class with typed private fields', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('php'));
    expect(out).toContain('<?php');
    expect(out).toContain('class Root');
    expect(out).toContain('private int $id;');
    expect(out).toContain('private string $name;');
  });

  it('generates C++ class with accessors', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1,"name":"Ada"}', ctx('cpp'));
    expect(out).toContain('class Root');
    expect(out).toContain('int64_t id;');
    expect(out).toContain('std::string name;');
  });
});

describe('jsonToTypesLogic — defaulting & determinism', () => {
  it('defaults to Go when no lang option is supplied', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1}', ctx());
    expect(out).toContain('type Root struct');
    expect(out).toContain('`json:"id"`');
  });

  it('defaults to Go when lang is undefined inside options', async () => {
    const out = await jsonToTypesLogic.transform('{"id":1}', {
      options: { lang: undefined as unknown as string },
      secondary: '',
    });
    expect(out).toContain('type Root struct');
  });

  it('is deterministic: same input + lang yields identical output', async () => {
    const a = await jsonToTypesLogic.transform(SAMPLE, ctx('typescript'));
    const b = await jsonToTypesLogic.transform(SAMPLE, ctx('typescript'));
    expect(a).toBe(b);
  });
});

describe('jsonToTypesLogic — type inference branches', () => {
  it('infers nested object as its own named interface (TypeScript)', async () => {
    const out = await jsonToTypesLogic.transform(SAMPLE, ctx('typescript'));
    expect(out).toContain('interface Root');
    expect(out).toContain('interface Meta');
    expect(out).toContain('meta:');
  });

  it('infers string arrays (Go)', async () => {
    const out = await jsonToTypesLogic.transform('{"tags":["a","b"]}', ctx('go'));
    expect(out).toContain('[]string');
  });

  it('infers boolean and float fields (Go)', async () => {
    const out = await jsonToTypesLogic.transform('{"active":true,"score":3.5}', ctx('go'));
    expect(out).toContain('bool');
    expect(out).toContain('float64');
  });

  it('infers nested arrays as Array<number[]> (TypeScript)', async () => {
    const out = await jsonToTypesLogic.transform('{"matrix":[[1,2],[3,4]]}', ctx('typescript'));
    expect(out).toContain('matrix:');
    expect(out).toContain('Array<number[]>');
  });

  it('infers union types for mixed arrays (TypeScript)', async () => {
    const out = await jsonToTypesLogic.transform('{"vals":[1,"two",true]}', ctx('typescript'));
    expect(out).toContain('boolean | number | string');
  });

  it('infers a top-level number alias (Go)', async () => {
    const out = await jsonToTypesLogic.transform('42', ctx('go'));
    expect(out).toContain('type Root int64');
  });

  it('infers a top-level string alias (TypeScript)', async () => {
    const out = await jsonToTypesLogic.transform('"hello"', ctx('typescript'));
    expect(out).toContain('type Root = string');
  });

  it('infers a null field as null type (TypeScript)', async () => {
    const out = await jsonToTypesLogic.transform('{"a":null}', ctx('typescript'));
    expect(out).toContain('a:');
    expect(out).toContain('null');
  });

  it('renders an empty struct for {} (Go)', async () => {
    const out = await jsonToTypesLogic.transform('{}', ctx('go'));
    expect(out).toContain('type Root struct');
    // no fields
    expect(out).not.toContain('json:');
  });

  it('treats large integers as int64 (Go), not float', async () => {
    const out = await jsonToTypesLogic.transform('{"big":9999999999}', ctx('go'));
    expect(out).toMatch(/Big\s+int64/);
  });

  it('handles negative and zero integers as int64 (Go)', async () => {
    const out = await jsonToTypesLogic.transform('{"neg":-5,"zero":0}', ctx('go'));
    expect(out).toMatch(/Neg\s+int64/);
    expect(out).toMatch(/Zero\s+int64/);
  });

  it('arrays of objects produce a single merged interface (TypeScript)', async () => {
    const out = await jsonToTypesLogic.transform('[{"a":1},{"a":2}]', ctx('typescript'));
    expect(out).toContain('interface Root');
    expect(out).toContain('a:');
  });
});

describe('jsonToTypesLogic — unicode & special characters', () => {
  it('preserves unicode and emoji in field names / values (Go)', async () => {
    const out = await jsonToTypesLogic.transform(
      '{"naïve":"café ☕","emoji":"😀"}',
      ctx('go'),
    );
    expect(out).toContain('type Root struct');
    expect(out).toContain('`json:"naïve"`');
    expect(out).toContain('`json:"emoji"`');
  });

  it('handles deeply nested unicode object (TypeScript)', async () => {
    const out = await jsonToTypesLogic.transform('{"日本語":{"値":"テスト"}}', ctx('typescript'));
    expect(out).toContain('interface Root');
  });
});

describe('jsonToTypesLogic — large input', () => {
  it('handles a large object with many distinct fields (TypeScript)', async () => {
    // Mixed value types keep this an object (not collapsed to a map),
    // so a named interface with each field is emitted.
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < 60; i++) {
      obj[`field_${i}`] = i % 3 === 0 ? `s${i}` : i % 3 === 1 ? i : i % 2 === 0;
    }
    const out = await jsonToTypesLogic.transform(JSON.stringify(obj), ctx('typescript'));
    expect(out).toContain('interface Root');
    expect(out).toContain('field_0:');
    expect(out).toContain('field_59:');
  });

  it('handles a large array of uniform objects, generating an element struct (Go)', async () => {
    const arr = Array.from({ length: 500 }, (_, i) => ({ id: i, label: `n${i}` }));
    const out = await jsonToTypesLogic.transform(JSON.stringify(arr), ctx('go'));
    expect(out).toContain('type Root []RootElement');
    expect(out).toContain('type RootElement struct');
    expect(out).toContain('`json:"id"`');
    expect(out).toContain('`json:"label"`');
  });
});

describe('jsonToTypesLogic — error paths', () => {
  it('throws on malformed JSON (unquoted token)', async () => {
    await expect(jsonToTypesLogic.transform('not json', ctx('go'))).rejects.toThrow();
  });

  it('throws on empty string', async () => {
    await expect(jsonToTypesLogic.transform('', ctx('go'))).rejects.toThrow();
  });

  it('throws on whitespace-only input', async () => {
    await expect(jsonToTypesLogic.transform('   ', ctx('go'))).rejects.toThrow();
  });

  it('throws on trailing-comma JSON', async () => {
    await expect(
      jsonToTypesLogic.transform('{"a":1,}', ctx('typescript')),
    ).rejects.toThrow();
  });

  it('throws on unterminated object', async () => {
    await expect(jsonToTypesLogic.transform('{"a":1', ctx('go'))).rejects.toThrow();
  });

  it('reports a syntax error message rather than crashing silently', async () => {
    await expect(jsonToTypesLogic.transform('{bad}', ctx('go'))).rejects.toThrow(/Syntax/i);
  });
});
