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

  it('throws on invalid input', () => {
    expect(() => uuidValidateLogic.transform('not-a-uuid', ctx)).toThrow(
      'Not a valid UUID.',
    );
  });
});
