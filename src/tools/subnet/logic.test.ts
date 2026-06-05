import { describe, it, expect } from 'vitest';
import { subnetLogic } from './logic';

describe('subnet', () => {
  it('computes a /24 network', () => {
    const out = subnetLogic.transform('192.168.1.10/24');
    expect(out).toContain('Network:    192.168.1.0/24');
    expect(out).toContain('Netmask:    255.255.255.0');
    expect(out).toContain('Broadcast:  192.168.1.255');
    expect(out).toContain('Usable:     254');
  });
  it('handles a /30', () => {
    expect(subnetLogic.transform('10.0.0.1/30')).toContain('Usable:     2');
  });
  it('reports no usable hosts for /32', () => {
    expect(subnetLogic.transform('10.0.0.1/32')).toContain('Usable:     0');
  });
  it('throws on an invalid prefix', () => {
    expect(() => subnetLogic.transform('10.0.0.1/40')).toThrow();
  });
  it('throws on an invalid octet', () => {
    expect(() => subnetLogic.transform('10.0.0.999/24')).toThrow();
  });
});
