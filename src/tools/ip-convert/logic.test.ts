import { describe, it, expect } from 'vitest';
import { ipConvertLogic } from './logic';

const conv = (s: string, mode = 'to-int') =>
  ipConvertLogic.transform(s, { options: { mode }, secondary: '' });

describe('ipConvert', () => {
  it('converts an IP to an integer', () => {
    expect(conv('192.168.1.1', 'to-int')).toBe('3232235777');
  });
  it('converts an integer to an IP', () => {
    expect(conv('3232235777', 'to-ip')).toBe('192.168.1.1');
  });
  it('throws on an invalid octet', () => {
    expect(() => conv('999.1.1.1', 'to-int')).toThrow();
  });
});
