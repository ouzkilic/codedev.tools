import { describe, it, expect } from 'vitest';
import { buildToken, TOKEN_OPTIONS } from './logic';

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

  it('defaults to hex format when format option is missing', () => {
    const token = buildToken({ bytes: '8', count: '1' });
    expect(token).toMatch(/^[0-9a-f]{16}$/);
  });

  it('falls back to hex for an unknown format value', () => {
    const token = buildToken({ format: 'uuid', bytes: '8', count: '1' });
    expect(token).toMatch(/^[0-9a-f]{16}$/);
  });

  it('uses default 32 bytes when bytes is omitted (hex -> 64 chars)', () => {
    const token = buildToken({ format: 'hex', count: '1' });
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('uses default count of 1 when count is omitted', () => {
    const lines = buildToken({ format: 'hex', bytes: '4' }).split('\n');
    expect(lines).toHaveLength(1);
  });

  it('returns a single token (no newline) for count 1', () => {
    const token = buildToken({ format: 'alphanumeric', bytes: '5', count: '1' });
    expect(token.includes('\n')).toBe(false);
  });

  it('clamps count above the max of 100 down to 100', () => {
    const lines = buildToken({ format: 'hex', bytes: '4', count: '500' }).split('\n');
    expect(lines).toHaveLength(100);
  });

  it('clamps count below the min of 1 up to 1', () => {
    const lines = buildToken({ format: 'hex', bytes: '4', count: '0' }).split('\n');
    expect(lines).toHaveLength(1);
    const negLines = buildToken({ format: 'hex', bytes: '4', count: '-5' }).split('\n');
    expect(negLines).toHaveLength(1);
  });

  it('clamps bytes above the max of 256 down to 256 (hex -> 512 chars)', () => {
    const token = buildToken({ format: 'hex', bytes: '9999', count: '1' });
    expect(token).toMatch(/^[0-9a-f]{512}$/);
  });

  it('clamps bytes below the min of 1 up to 1 (hex -> 2 chars)', () => {
    const token = buildToken({ format: 'hex', bytes: '0', count: '1' });
    expect(token).toMatch(/^[0-9a-f]{2}$/);
  });

  it('alphanumeric token length equals the byte count', () => {
    const token = buildToken({ format: 'alphanumeric', bytes: '40', count: '1' });
    expect(token).toHaveLength(40);
    expect(token).toMatch(/^[A-Za-z0-9]{40}$/);
  });

  it('parses bytes with leading numeric content via parseInt semantics', () => {
    // parseInt('12abc', 10) === 12 -> 12 bytes -> 24 hex chars
    const token = buildToken({ format: 'hex', bytes: '12abc', count: '1' });
    expect(token).toMatch(/^[0-9a-f]{24}$/);
  });

  it('generates multiple base64url tokens each without padding', () => {
    const lines = buildToken({ format: 'base64url', bytes: '16', count: '5' }).split('\n');
    expect(lines).toHaveLength(5);
    expect(lines.every((t) => /^[A-Za-z0-9_-]+$/.test(t))).toBe(true);
    expect(lines.every((t) => !t.includes('='))).toBe(true);
  });

  it('produces distinct tokens across a batch (random)', () => {
    const lines = buildToken({ format: 'hex', bytes: '32', count: '10' }).split('\n');
    const unique = new Set(lines);
    expect(unique.size).toBe(10);
  });

  it('exposes the expected option metadata', () => {
    const keys = TOKEN_OPTIONS.map((o) => o.key);
    expect(keys).toEqual(['format', 'bytes', 'count']);
    const format = TOKEN_OPTIONS.find((o) => o.key === 'format');
    expect(format?.type).toBe('select');
    expect(format?.choices?.map((c) => c.value)).toEqual(['hex', 'base64url', 'alphanumeric']);
    expect(format?.default).toBe('hex');
  });
});
