import { describe, it, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { fakeValue, generateFake } from './logic';

describe('faker', () => {
  it('generates an email', () => {
    expect(fakeValue(faker, 'email')).toContain('@');
  });
  it('generates a uuid', () => {
    expect(fakeValue(faker, 'uuid')).toMatch(/^[0-9a-f-]{36}$/i);
  });
  it('generates a numeric string for number', () => {
    expect(fakeValue(faker, 'number')).toMatch(/^\d+$/);
  });
  it('produces the requested count of lines', async () => {
    const out = await generateFake('fullName', 5);
    expect(out.split('\n')).toHaveLength(5);
  });
});
