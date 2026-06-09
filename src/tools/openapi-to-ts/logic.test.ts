import { describe, it, expect } from 'vitest';
import { openapiToTsLogic } from './logic';

describe('openapiToTsLogic', () => {
  it('generates an interface from an OpenAPI 3 schema', () => {
    const spec =
      '{"openapi":"3.0.0","components":{"schemas":{"User":{"type":"object","properties":{"id":{"type":"integer"},"name":{"type":"string"}},"required":["id"]}}}}';
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('export interface User {');
    expect(out).toContain('id: number;');
    expect(out).toContain('name?: string;');
  });

  it('resolves $ref properties to the referenced interface name', () => {
    const spec = JSON.stringify({
      openapi: '3.0.0',
      components: {
        schemas: {
          Order: {
            type: 'object',
            properties: { owner: { $ref: '#/components/schemas/User' } },
            required: ['owner'],
          },
          User: { type: 'object', properties: { id: { type: 'integer' } } },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('owner: User;');
  });

  it('maps arrays to T[]', () => {
    const spec = JSON.stringify({
      openapi: '3.0.0',
      components: {
        schemas: {
          Tags: {
            type: 'object',
            properties: { values: { type: 'array', items: { type: 'string' } } },
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('values?: string[];');
  });

  it('parses YAML input and supports Swagger 2 definitions', () => {
    const spec = [
      'swagger: "2.0"',
      'definitions:',
      '  Pet:',
      '    type: object',
      '    properties:',
      '      active:',
      '        type: boolean',
      '    required:',
      '      - active',
    ].join('\n');
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('export interface Pet {');
    expect(out).toContain('active: boolean;');
  });

  it('throws when no schemas are present', () => {
    expect(() => openapiToTsLogic.transform('{"openapi":"3.0.0"}')).toThrow(
      'No schemas found',
    );
  });

  // --- type mapping branches ---

  it('maps integer and number to number, string to string, boolean to boolean', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Mixed: {
            type: 'object',
            properties: {
              a: { type: 'integer' },
              b: { type: 'number' },
              c: { type: 'string' },
              d: { type: 'boolean' },
            },
            required: ['a', 'b', 'c', 'd'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('a: number;');
    expect(out).toContain('b: number;');
    expect(out).toContain('c: string;');
    expect(out).toContain('d: boolean;');
  });

  it('maps an array without items to unknown[]', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          List: {
            type: 'object',
            properties: { items: { type: 'array' } },
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('items?: unknown[];');
  });

  it('maps an object property with nested properties to an inline type', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Wrapper: {
            type: 'object',
            properties: {
              point: {
                type: 'object',
                properties: { x: { type: 'integer' }, y: { type: 'integer' } },
              },
            },
            required: ['point'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('point: { x: number; y: number };');
  });

  it('maps an object without properties to Record<string, unknown>', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Bag: {
            type: 'object',
            properties: { meta: { type: 'object' } },
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('meta?: Record<string, unknown>;');
  });

  it('maps unknown / missing type to unknown', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Thing: {
            type: 'object',
            properties: { weird: { type: 'whatever' }, none: {} },
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('weird?: unknown;');
    expect(out).toContain('none?: unknown;');
  });

  it('maps a nested array of $ref to RefName[]', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Cart: {
            type: 'object',
            properties: {
              lines: {
                type: 'array',
                items: { $ref: '#/components/schemas/LineItem' },
              },
            },
            required: ['lines'],
          },
          LineItem: { type: 'object', properties: { sku: { type: 'string' } } },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('lines: LineItem[];');
  });

  it('maps nested arrays of arrays to T[][]', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Matrix: {
            type: 'object',
            properties: {
              grid: {
                type: 'array',
                items: { type: 'array', items: { type: 'number' } },
              },
            },
            required: ['grid'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('grid: number[][];');
  });

  // --- enum branch ---

  it('maps a string enum to a quoted string union', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Status: {
            type: 'object',
            properties: {
              state: { type: 'string', enum: ['open', 'closed'] },
            },
            required: ['state'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('state: "open" | "closed";');
  });

  it('maps a numeric/boolean enum to a non-quoted union', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Flags: {
            type: 'object',
            properties: {
              level: { type: 'integer', enum: [1, 2, 3] },
              toggle: { type: 'boolean', enum: [true, false] },
            },
            required: ['level', 'toggle'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('level: 1 | 2 | 3;');
    expect(out).toContain('toggle: true | false;');
  });

  it('ignores an empty enum array and falls back to the declared type', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          E: {
            type: 'object',
            properties: { v: { type: 'string', enum: [] } },
            required: ['v'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('v: string;');
  });

  it('prioritises $ref over enum and type', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          R: {
            type: 'object',
            properties: {
              ref: {
                $ref: '#/components/schemas/Target',
                type: 'string',
                enum: ['x'],
              },
            },
            required: ['ref'],
          },
          Target: { type: 'object', properties: { id: { type: 'string' } } },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('ref: Target;');
  });

  // --- $ref name resolution edge cases ---

  it('resolves a $ref with a trailing slash to "unknown"', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Weird: {
            type: 'object',
            properties: { x: { $ref: 'foo/' } },
            required: ['x'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('x: unknown;');
  });

  it('resolves a $ref without slashes to the whole string', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Weird: {
            type: 'object',
            properties: { x: { $ref: 'Plain' } },
            required: ['x'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('x: Plain;');
  });

  // --- required / optional handling ---

  it('marks properties not in required as optional and required ones as not', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          P: {
            type: 'object',
            properties: { req: { type: 'string' }, opt: { type: 'string' } },
            required: ['req'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('req: string;');
    expect(out).toContain('opt?: string;');
  });

  it('treats all properties as optional when required is absent', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          P: { type: 'object', properties: { a: { type: 'string' } } },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('a?: string;');
  });

  // --- multiple schemas / structure ---

  it('emits multiple interfaces separated by a blank line', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          A: { type: 'object', properties: { a: { type: 'string' } } },
          B: { type: 'object', properties: { b: { type: 'string' } } },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('export interface A {');
    expect(out).toContain('export interface B {');
    expect(out).toMatch(/}\n\nexport interface B/);
  });

  it('produces an empty body for a schema with no properties', () => {
    const spec = JSON.stringify({
      components: { schemas: { Empty: { type: 'object' } } },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toBe('export interface Empty {\n\n}');
  });

  it('prefers components.schemas over definitions when both exist', () => {
    const spec = JSON.stringify({
      components: {
        schemas: { FromComponents: { type: 'object', properties: {} } },
      },
      definitions: { FromDefinitions: { type: 'object', properties: {} } },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('export interface FromComponents {');
    expect(out).not.toContain('FromDefinitions');
  });

  it('is deterministic across repeated runs', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          U: {
            type: 'object',
            properties: { id: { type: 'integer' }, name: { type: 'string' } },
            required: ['id'],
          },
        },
      },
    });
    expect(openapiToTsLogic.transform(spec)).toBe(
      openapiToTsLogic.transform(spec),
    );
  });

  // --- unicode / special chars ---

  it('preserves unicode and emoji in enum string unions', () => {
    const spec = JSON.stringify({
      components: {
        schemas: {
          Emoji: {
            type: 'object',
            properties: { mood: { type: 'string', enum: ['😀', 'üğş'] } },
            required: ['mood'],
          },
        },
      },
    });
    const out = openapiToTsLogic.transform(spec);
    expect(out).toContain('"😀"');
    expect(out).toContain('"üğş"');
  });

  // --- error / edge paths ---

  it('throws on an empty string input', () => {
    expect(() => openapiToTsLogic.transform('')).toThrow('No schemas found');
  });

  it('throws on whitespace-only input', () => {
    expect(() => openapiToTsLogic.transform('   \n  ')).toThrow(
      'No schemas found',
    );
  });

  it('throws "No schemas found" for a JSON primitive (not an object)', () => {
    expect(() => openapiToTsLogic.transform('42')).toThrow('No schemas found');
  });

  it('throws "No schemas found" for a JSON null literal', () => {
    expect(() => openapiToTsLogic.transform('null')).toThrow('No schemas found');
  });

  it('throws when schemas object is present but empty', () => {
    expect(() =>
      openapiToTsLogic.transform('{"components":{"schemas":{}}}'),
    ).toThrow('No schemas found');
  });

  it('throws "not valid JSON or YAML" for malformed unparseable input', () => {
    // Invalid as JSON, and invalid YAML (bad indentation/flow) -> yaml.load throws.
    expect(() => openapiToTsLogic.transform('{ "a": [1, 2,')).toThrow(
      'not valid JSON or YAML',
    );
  });

  it('handles a large spec with many schemas', () => {
    const schemas: Record<string, unknown> = {};
    for (let i = 0; i < 200; i++) {
      schemas[`Model${i}`] = {
        type: 'object',
        properties: { id: { type: 'integer' }, name: { type: 'string' } },
        required: ['id'],
      };
    }
    const out = openapiToTsLogic.transform(JSON.stringify({ components: { schemas } }));
    expect(out).toContain('export interface Model0 {');
    expect(out).toContain('export interface Model199 {');
    expect((out.match(/export interface/g) ?? []).length).toBe(200);
  });
});
