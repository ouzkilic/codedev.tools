import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { timezoneLogic } from './logic';

const ctx = (tz: string): ToolContext => ({ options: { tz }, secondary: '' });

describe('timezoneLogic', () => {
  it('formats an instant in UTC', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('UTC'));
    expect(out).toBe('2024-01-01 12:00:00 (UTC)');
  });

  it('converts to America/New_York (winter, EST -05:00)', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('America/New_York'));
    expect(out).toBe('2024-01-01 07:00:00 (America/New_York)');
  });

  it('converts to America/New_York (summer, EDT -04:00)', () => {
    const out = timezoneLogic.transform('2024-07-01T12:00:00Z', ctx('America/New_York'));
    expect(out).toBe('2024-07-01 08:00:00 (America/New_York)');
  });

  it('converts to America/Los_Angeles', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('America/Los_Angeles'));
    expect(out).toBe('2024-01-01 04:00:00 (America/Los_Angeles)');
  });

  it('converts to Europe/London (winter == UTC)', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('Europe/London'));
    expect(out).toBe('2024-01-01 12:00:00 (Europe/London)');
  });

  it('converts to Europe/London (summer, BST +01:00)', () => {
    const out = timezoneLogic.transform('2024-07-01T12:00:00Z', ctx('Europe/London'));
    expect(out).toBe('2024-07-01 13:00:00 (Europe/London)');
  });

  it('converts to Europe/Paris', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('Europe/Paris'));
    expect(out).toBe('2024-01-01 13:00:00 (Europe/Paris)');
  });

  it('converts to Asia/Tokyo', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('Asia/Tokyo'));
    expect(out).toBe('2024-01-01 21:00:00 (Asia/Tokyo)');
  });

  it('converts to Asia/Shanghai', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('Asia/Shanghai'));
    expect(out).toBe('2024-01-01 20:00:00 (Asia/Shanghai)');
  });

  it('converts to Asia/Kolkata (half-hour offset)', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('Asia/Kolkata'));
    expect(out).toBe('2024-01-01 17:30:00 (Asia/Kolkata)');
  });

  it('converts to Australia/Sydney', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('Australia/Sydney'));
    expect(out).toBe('2024-01-01 23:00:00 (Australia/Sydney)');
  });

  it('rolls the date backward across midnight (NY behind UTC)', () => {
    const out = timezoneLogic.transform('2024-01-01T00:00:00Z', ctx('America/New_York'));
    expect(out).toBe('2023-12-31 19:00:00 (America/New_York)');
  });

  it('rolls the date forward across midnight (Istanbul ahead of UTC)', () => {
    const out = timezoneLogic.transform('2024-02-29T23:30:00Z', ctx('Europe/Istanbul'));
    expect(out).toBe('2024-03-01 02:30:00 (Europe/Istanbul)');
  });

  it('handles the unix epoch', () => {
    const out = timezoneLogic.transform('1970-01-01T00:00:00Z', ctx('UTC'));
    expect(out).toBe('1970-01-01 00:00:00 (UTC)');
  });

  it('defaults to Europe/Istanbul when no ctx is provided', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z');
    expect(out).toBe('2024-01-01 15:00:00 (Europe/Istanbul)');
  });

  it('defaults to Europe/Istanbul when tz option is missing', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', { options: {}, secondary: '' });
    expect(out).toBe('2024-01-01 15:00:00 (Europe/Istanbul)');
  });

  it('trims surrounding whitespace before parsing', () => {
    const out = timezoneLogic.transform('  2024-01-01T12:00:00Z  ', ctx('UTC'));
    expect(out).toBe('2024-01-01 12:00:00 (UTC)');
  });

  it('appends the timezone label in the output', () => {
    const out = timezoneLogic.transform('2024-07-01T12:00:00Z', ctx('Asia/Tokyo'));
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \(Asia\/Tokyo\)$/);
  });

  it('throws on a non-date string', () => {
    expect(() => timezoneLogic.transform('not a date', ctx('UTC'))).toThrow('Invalid date input');
  });

  it('throws on empty input', () => {
    expect(() => timezoneLogic.transform('', ctx('UTC'))).toThrow('Invalid date input');
  });

  it('throws on whitespace-only input', () => {
    expect(() => timezoneLogic.transform('   ', ctx('UTC'))).toThrow('Invalid date input');
  });

  it('throws on an unrecognized timezone (Intl RangeError)', () => {
    expect(() => timezoneLogic.transform('2024-01-01T12:00:00Z', ctx('Not/AZone'))).toThrow();
  });

  it('exposes a single tz select option defaulting to Europe/Istanbul', () => {
    const tzOption = timezoneLogic.options?.find((o) => o.key === 'tz');
    expect(tzOption).toBeDefined();
    expect(tzOption?.type).toBe('select');
    expect(tzOption?.default).toBe('Europe/Istanbul');
    expect(tzOption?.choices?.length).toBe(10);
  });

  it('correctly formats every declared timezone choice without error', () => {
    const choices = timezoneLogic.options?.find((o) => o.key === 'tz')?.choices ?? [];
    for (const choice of choices) {
      const out = timezoneLogic.transform('2024-01-01T12:00:00Z', ctx(choice.value));
      expect(out).toContain(`(${choice.value})`);
      expect(out).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} /);
    }
  });
});
