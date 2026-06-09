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

  it('reports the full set of fields for a /24', () => {
    const out = subnetLogic.transform('192.168.1.10/24');
    expect(out).toContain('Total IPs:  256');
    expect(out).toContain('First host: 192.168.1.1');
    expect(out).toContain('Last host:  192.168.1.254');
  });

  it('produces exactly seven lines when usable hosts exist', () => {
    const lines = subnetLogic.transform('192.168.1.10/24').split('\n');
    expect(lines).toHaveLength(7);
  });

  it('omits host lines when there are no usable hosts (/32)', () => {
    const out = subnetLogic.transform('10.0.0.1/32');
    const lines = out.split('\n');
    expect(lines).toHaveLength(5);
    expect(out).not.toContain('First host:');
    expect(out).not.toContain('Last host:');
    expect(out).toContain('Total IPs:  1');
    expect(out).toContain('Network:    10.0.0.1/32');
    expect(out).toContain('Broadcast:  10.0.0.1');
    expect(out).toContain('Netmask:    255.255.255.255');
  });

  it('omits host lines for a /31 point-to-point link', () => {
    const out = subnetLogic.transform('10.0.0.0/31');
    const lines = out.split('\n');
    expect(lines).toHaveLength(5);
    expect(out).toContain('Usable:     0');
    expect(out).toContain('Total IPs:  2');
    expect(out).toContain('Netmask:    255.255.255.254');
    expect(out).not.toContain('First host:');
  });

  it('handles a /30 with full host details', () => {
    const out = subnetLogic.transform('10.0.0.1/30');
    expect(out).toContain('Network:    10.0.0.0/30');
    expect(out).toContain('Netmask:    255.255.255.252');
    expect(out).toContain('Broadcast:  10.0.0.3');
    expect(out).toContain('Total IPs:  4');
    expect(out).toContain('First host: 10.0.0.1');
    expect(out).toContain('Last host:  10.0.0.2');
  });

  it('handles a /16 network', () => {
    const out = subnetLogic.transform('172.16.5.4/16');
    expect(out).toContain('Network:    172.16.0.0/16');
    expect(out).toContain('Netmask:    255.255.0.0');
    expect(out).toContain('Broadcast:  172.16.255.255');
    expect(out).toContain('Total IPs:  65536');
    expect(out).toContain('Usable:     65534');
    expect(out).toContain('First host: 172.16.0.1');
    expect(out).toContain('Last host:  172.16.255.254');
  });

  it('handles a /8 network', () => {
    const out = subnetLogic.transform('10.20.30.40/8');
    expect(out).toContain('Network:    10.0.0.0/8');
    expect(out).toContain('Netmask:    255.0.0.0');
    expect(out).toContain('Broadcast:  10.255.255.255');
    expect(out).toContain('Total IPs:  16777216');
  });

  it('handles a /0 covering the entire IPv4 space', () => {
    const out = subnetLogic.transform('192.168.1.1/0');
    expect(out).toContain('Network:    0.0.0.0/0');
    expect(out).toContain('Netmask:    0.0.0.0');
    expect(out).toContain('Broadcast:  255.255.255.255');
    expect(out).toContain('Total IPs:  4294967296');
    expect(out).toContain('Usable:     4294967294');
    expect(out).toContain('First host: 0.0.0.1');
    expect(out).toContain('Last host:  255.255.255.254');
  });

  it('trims surrounding whitespace from the input', () => {
    const trimmed = subnetLogic.transform('  10.0.0.1/30  ');
    const plain = subnetLogic.transform('10.0.0.1/30');
    expect(trimmed).toBe(plain);
  });

  it('is idempotent on the network address (canonicalization)', () => {
    const first = subnetLogic.transform('192.168.1.10/24');
    const second = subnetLogic.transform('192.168.1.0/24');
    expect(first).toBe(second);
  });

  it('throws when the CIDR prefix is missing', () => {
    expect(() => subnetLogic.transform('192.168.1.1')).toThrow();
  });

  it('throws on a negative prefix', () => {
    expect(() => subnetLogic.transform('192.168.1.1/-1')).toThrow();
  });

  it('throws when the address has too few octets', () => {
    expect(() => subnetLogic.transform('192.168.1/24')).toThrow('Invalid IPv4 address.');
  });

  it('throws when the address has too many octets', () => {
    expect(() => subnetLogic.transform('192.168.1.1.1/24')).toThrow('Invalid IPv4 address.');
  });

  it('throws on an empty input', () => {
    expect(() => subnetLogic.transform('')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => subnetLogic.transform('   ')).toThrow();
  });

  it('throws on a non-numeric octet', () => {
    expect(() => subnetLogic.transform('10.0.0.x/24')).toThrow();
  });

  it('throws on an emoji in the address', () => {
    expect(() => subnetLogic.transform('10.0.0.🚀/24')).toThrow();
  });

  it('accepts the boundary octet value 255', () => {
    const out = subnetLogic.transform('255.255.255.255/32');
    expect(out).toContain('Network:    255.255.255.255/32');
  });
});
