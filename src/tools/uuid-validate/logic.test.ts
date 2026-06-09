import { describe, expect, it } from 'vitest';
import { uuidValidateLogic } from './logic';

describe('uuidValidateLogic', () => {
  const ctx = { options: {}, secondary: '' };

  it('validates a v4 UUID', () => {
    const out = uuidValidateLogic.transform(
      '550e8400-e29b-41d4-a716-446655440000',
      ctx,
    );
    expect(out).toContain('Valid UUID');
    expect(out).toContain('Version: 4');
  });

  it('reports version 1', () => {
    const out = uuidValidateLogic.transform(
      '123e4567-e89b-12d3-a456-426614174000',
      ctx,
    );
    expect(out).toContain('Version: 1');
  });

  it('reports version 2', () => {
    const out = uuidValidateLogic.transform(
      '000003e8-8b6e-21d4-a716-446655440000',
      ctx,
    );
    expect(out).toContain('Version: 2');
  });

  it('reports version 3', () => {
    const out = uuidValidateLogic.transform(
      '6fa459ea-ee8a-3ca4-894e-db77e160355e',
      ctx,
    );
    expect(out).toContain('Version: 3');
  });

  it('reports version 5', () => {
    const out = uuidValidateLogic.transform(
      '886313e1-3b8a-5372-9b90-0c9aee199e5d',
      ctx,
    );
    expect(out).toContain('Version: 5');
  });

  it('returns the exact two-line output', () => {
    const out = uuidValidateLogic.transform(
      '550e8400-e29b-41d4-a716-446655440000',
      ctx,
    );
    expect(out).toBe('Valid UUID\nVersion: 4');
  });

  it('trims surrounding whitespace before validating', () => {
    const out = uuidValidateLogic.transform(
      '   550e8400-e29b-41d4-a716-446655440000\n\t  ',
      ctx,
    );
    expect(out).toBe('Valid UUID\nVersion: 4');
  });

  it('accepts uppercase UUIDs (case-insensitive regex)', () => {
    const out = uuidValidateLogic.transform(
      '550E8400-E29B-41D4-A716-446655440000',
      ctx,
    );
    expect(out).toContain('Valid UUID');
    expect(out).toBe('Valid UUID\nVersion: 4');
  });

  it('accepts the 8-9-a-b variant nibbles', () => {
    for (const variant of ['8', '9', 'a', 'b']) {
      const id = `550e8400-e29b-41d4-${variant}716-446655440000`;
      const out = uuidValidateLogic.transform(id, ctx);
      expect(out).toContain('Valid UUID');
    }
  });

  it('throws on arbitrary non-UUID input', () => {
    expect(() => uuidValidateLogic.transform('not-a-uuid', ctx)).toThrow(
      'Not a valid UUID.',
    );
  });

  it('throws on empty input', () => {
    expect(() => uuidValidateLogic.transform('', ctx)).toThrow(
      'Not a valid UUID.',
    );
  });

  it('throws on whitespace-only input', () => {
    expect(() => uuidValidateLogic.transform('   \n\t ', ctx)).toThrow(
      'Not a valid UUID.',
    );
  });

  it('throws on version 0 (out of [1-5] range)', () => {
    expect(() =>
      uuidValidateLogic.transform(
        '550e8400-e29b-01d4-a716-446655440000',
        ctx,
      ),
    ).toThrow('Not a valid UUID.');
  });

  it('throws on version 6 (out of [1-5] range)', () => {
    expect(() =>
      uuidValidateLogic.transform(
        '550e8400-e29b-61d4-a716-446655440000',
        ctx,
      ),
    ).toThrow('Not a valid UUID.');
  });

  it('throws on an invalid variant nibble (c)', () => {
    expect(() =>
      uuidValidateLogic.transform(
        '550e8400-e29b-41d4-c716-446655440000',
        ctx,
      ),
    ).toThrow('Not a valid UUID.');
  });

  it('throws on the nil UUID (version digit is 0)', () => {
    expect(() =>
      uuidValidateLogic.transform(
        '00000000-0000-0000-0000-000000000000',
        ctx,
      ),
    ).toThrow('Not a valid UUID.');
  });

  it('throws when UUID has no hyphens', () => {
    expect(() =>
      uuidValidateLogic.transform(
        '550e8400e29b41d4a716446655440000',
        ctx,
      ),
    ).toThrow('Not a valid UUID.');
  });

  it('throws when a group has the wrong length', () => {
    expect(() =>
      uuidValidateLogic.transform(
        '550e840-e29b-41d4-a716-446655440000',
        ctx,
      ),
    ).toThrow('Not a valid UUID.');
  });

  it('throws on a non-hex character', () => {
    expect(() =>
      uuidValidateLogic.transform(
        '550e8400-e29b-41d4-a716-44665544000g',
        ctx,
      ),
    ).toThrow('Not a valid UUID.');
  });

  it('throws when trailing characters follow a valid UUID (anchored regex)', () => {
    expect(() =>
      uuidValidateLogic.transform(
        '550e8400-e29b-41d4-a716-446655440000 extra',
        ctx,
      ),
    ).toThrow('Not a valid UUID.');
  });

  it('throws on unicode/emoji input', () => {
    expect(() => uuidValidateLogic.transform('🆔🆔🆔', ctx)).toThrow(
      'Not a valid UUID.',
    );
  });

  it('throws on large non-UUID input', () => {
    expect(() =>
      uuidValidateLogic.transform('a'.repeat(10000), ctx),
    ).toThrow('Not a valid UUID.');
  });
});
