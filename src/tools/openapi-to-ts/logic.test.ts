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
});
