import { describe, it, expect } from 'vitest';
import { buildToken } from './logic';

describe('token', () => {
  it('generates lowercase hex of length 2*bytes', () => {
    const token = buildToken({ format: 'hex', bytes: '16', count: '1' });
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });

  it('generates url-safe base64 without padding', () => {
    const token = buildToken({ format: 'base64url', bytes: '32', count: '1' });
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.includes('=')).toBe(false);
  });

  it('generates the requested count of alphanumeric tokens', () => {
    const lines = buildToken({ format: 'alphanumeric', bytes: '10', count: '3' }).split('\n');
    expect(lines).toHaveLength(3);
    expect(lines.every((t) => /^[A-Za-z0-9]{10}$/.test(t))).toBe(true);
  });

  it('clamps invalid bytes/count to defaults', () => {
    const lines = buildToken({ format: 'hex', bytes: 'x', count: 'y' }).split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/^[0-9a-f]{64}$/);
  });
});
