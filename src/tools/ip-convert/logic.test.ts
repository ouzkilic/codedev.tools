import { describe, it, expect } from 'vitest';
import { ipConvertLogic } from './logic';

const conv = (s: string, mode = 'to-int') =>
  ipConvertLogic.transform(s, { options: { mode }, secondary: '' });

describe('ipConvert metadata', () => {
  it('exposes a single mode select option defaulting to to-int', () => {
    const opts = ipConvertLogic.options ?? [];
    expect(opts).toHaveLength(1);
    const mode = opts[0];
    expect(mode.key).toBe('mode');
    expect(mode.type).toBe('select');
    expect(mode.default).toBe('to-int');
    expect(mode.choices?.map((c) => c.value)).toEqual(['to-int', 'to-ip']);
  });

  it('defaults to to-int when no options/ctx are provided', () => {
    expect(ipConvertLogic.transform('192.168.1.1')).toBe('3232235777');
  });

  it('falls back to to-int when mode option is missing', () => {
    expect(ipConvertLogic.transform('192.168.1.1', { options: {}, secondary: '' })).toBe(
      '3232235777',
    );
  });
});

describe('ipConvert to-int (IP -> Integer)', () => {
  it('converts a typical private IP', () => {
    expect(conv('192.168.1.1', 'to-int')).toBe('3232235777');
  });

  it('converts the zero address to 0', () => {
    expect(conv('0.0.0.0', 'to-int')).toBe('0');
  });

  it('converts the broadcast address to the max uint32', () => {
    expect(conv('255.255.255.255', 'to-int')).toBe('4294967295');
  });

  it('converts a loopback-style address', () => {
    // 127*2^24 + 0 + 0 + 1
    expect(conv('127.0.0.1', 'to-int')).toBe('2130706433');
  });

  it('converts an address whose high octet sets bit 31 (stays unsigned)', () => {
    // 128.0.0.0 = 2147483648 (> 2^31) must remain unsigned via >>> 0
    expect(conv('128.0.0.0', 'to-int')).toBe('2147483648');
  });

  it('trims surrounding whitespace before parsing', () => {
    expect(conv('   10.0.0.5   ', 'to-int')).toBe(String(10 * 16777216 + 5));
  });

  it('throws on an octet greater than 255', () => {
    expect(() => conv('999.1.1.1', 'to-int')).toThrow('Invalid octet');
  });

  it('throws on a negative octet', () => {
    expect(() => conv('-1.0.0.0', 'to-int')).toThrow('Invalid octet');
  });

  it('throws on a non-numeric octet', () => {
    expect(() => conv('a.b.c.d', 'to-int')).toThrow('Invalid octet');
  });

  it('throws on a fractional octet', () => {
    expect(() => conv('1.2.3.4.5', 'to-int')).toThrow('Invalid IPv4 address.');
    expect(() => conv('1.2.5', 'to-int')).toThrow('Invalid IPv4 address.');
  });

  it('throws on a scientific-notation octet', () => {
    // '1e3' is not 1-3 decimal digits -> Invalid octet
    expect(() => conv('1e3.0.0.0', 'to-int')).toThrow('Invalid octet');
  });

  it('throws on empty input (one empty part)', () => {
    expect(() => conv('', 'to-int')).toThrow('Invalid IPv4 address.');
  });

  it('throws on whitespace-only input', () => {
    expect(() => conv('    ', 'to-int')).toThrow('Invalid IPv4 address.');
  });

  it('throws on a trailing dot (5 parts with empty)', () => {
    expect(() => conv('1.2.3.4.', 'to-int')).toThrow('Invalid IPv4 address.');
  });

  it('throws on a leading dot (5 parts with empty)', () => {
    expect(() => conv('.1.2.3.4', 'to-int')).toThrow('Invalid IPv4 address.');
  });

  it('throws on an empty octet from a double dot', () => {
    // "1.2..4" -> empty middle octet must be rejected (no longer treated as 0).
    expect(() => conv('1.2..4', 'to-int')).toThrow('Invalid octet');
  });

  it('throws on a hex-looking octet', () => {
    // '0x10' is not 1-3 decimal digits -> rejected (no Number coercion to 16)
    expect(() => conv('0x10.0.0.0', 'to-int')).toThrow('Invalid octet');
  });
});

describe('ipConvert to-ip (Integer -> IP)', () => {
  it('converts a typical integer back to an IP', () => {
    expect(conv('3232235777', 'to-ip')).toBe('192.168.1.1');
  });

  it('converts 0 to the zero address', () => {
    expect(conv('0', 'to-ip')).toBe('0.0.0.0');
  });

  it('converts the max uint32 to the broadcast address', () => {
    expect(conv('4294967295', 'to-ip')).toBe('255.255.255.255');
  });

  it('converts an integer with bit 31 set (unsigned shift)', () => {
    expect(conv('2147483648', 'to-ip')).toBe('128.0.0.0');
  });

  it('trims whitespace and converts', () => {
    expect(conv('  2130706433  ', 'to-ip')).toBe('127.0.0.1');
  });

  it('throws on empty input (no longer coerced to 0)', () => {
    expect(() => conv('', 'to-ip')).toThrow('Invalid integer.');
  });

  it('throws on whitespace-only input (no longer coerced to 0)', () => {
    expect(() => conv('   ', 'to-ip')).toThrow('Invalid integer.');
  });

  it('throws on a negative integer', () => {
    expect(() => conv('-1', 'to-ip')).toThrow('Invalid integer.');
  });

  it('throws on an integer above the max uint32', () => {
    expect(() => conv('4294967296', 'to-ip')).toThrow('Invalid integer.');
  });

  it('throws on a fractional value', () => {
    expect(() => conv('123.45', 'to-ip')).toThrow('Invalid integer.');
  });

  it('throws on a non-numeric value (NaN)', () => {
    expect(() => conv('abc', 'to-ip')).toThrow('Invalid integer.');
  });

  it('throws on an emoji / unicode value', () => {
    expect(() => conv('🚀', 'to-ip')).toThrow('Invalid integer.');
  });

  it('throws on scientific-notation input (no Number coercion)', () => {
    expect(() => conv('1e3', 'to-ip')).toThrow('Invalid integer.');
  });

  it('throws on hex-looking input (no Number coercion)', () => {
    expect(() => conv('0x10', 'to-ip')).toThrow('Invalid integer.');
  });
});

describe('ipConvert round-trips and determinism', () => {
  const samples = ['0.0.0.0', '255.255.255.255', '192.168.1.1', '127.0.0.1', '10.20.30.40'];

  it('round-trips IP -> int -> IP for representative samples', () => {
    for (const ip of samples) {
      const asInt = conv(ip, 'to-int');
      expect(conv(asInt, 'to-ip')).toBe(ip);
    }
  });

  it('round-trips int -> IP -> int for boundary integers', () => {
    for (const n of ['0', '1', '2147483648', '4294967295']) {
      const asIp = conv(n, 'to-ip');
      expect(conv(asIp, 'to-int')).toBe(n);
    }
  });

  it('is deterministic for repeated calls', () => {
    expect(conv('8.8.8.8', 'to-int')).toBe(conv('8.8.8.8', 'to-int'));
    expect(conv('134744072', 'to-ip')).toBe(conv('134744072', 'to-ip'));
  });
});
