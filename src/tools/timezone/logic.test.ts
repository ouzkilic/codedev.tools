import { describe, it, expect } from 'vitest';
import { timezoneLogic } from './logic';

describe('timezoneLogic', () => {
  it('formats an instant in UTC', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', {
      options: { tz: 'UTC' },
      secondary: '',
    });
    expect(out).toContain('12:00:00');
    expect(out).toContain('(UTC)');
  });

  it('converts to America/New_York', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', {
      options: { tz: 'America/New_York' },
      secondary: '',
    });
    expect(out).toContain('07:00:00');
    expect(out).toContain('(America/New_York)');
  });

  it('converts to Asia/Tokyo', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z', {
      options: { tz: 'Asia/Tokyo' },
      secondary: '',
    });
    expect(out).toContain('21:00:00');
  });

  it('defaults to Europe/Istanbul when no option provided', () => {
    const out = timezoneLogic.transform('2024-01-01T12:00:00Z');
    expect(out).toContain('(Europe/Istanbul)');
    expect(out).toContain('15:00:00');
  });

  it('throws on invalid date', () => {
    expect(() =>
      timezoneLogic.transform('not a date', { options: { tz: 'UTC' }, secondary: '' }),
    ).toThrow();
  });
});
