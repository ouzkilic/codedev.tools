import type { ToolLogic } from '@/hooks/useToolState';

function ipToInt(ip: string): number {
  const parts = ip.split('.');
  if (parts.length !== 4) throw new Error('Invalid IPv4 address.');
  return parts.reduce((acc, octet) => {
    const n = Number(octet);
    if (!Number.isInteger(n) || n < 0 || n > 255) throw new Error(`Invalid octet: ${octet}.`);
    return (acc << 8) + n;
  }, 0) >>> 0;
}

const intToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');

export const subnetLogic: ToolLogic = {
  transform(input: string): string {
    const [ip, prefixStr] = input.trim().split('/');
    const prefix = parseInt(prefixStr, 10);
    if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
      throw new Error('Provide CIDR notation, e.g. 192.168.1.0/24.');
    }
    const ipInt = ipToInt(ip);
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const totalAddresses = 2 ** (32 - prefix);
    const usableHosts = prefix >= 31 ? 0 : totalAddresses - 2;

    const lines = [
      `Network:    ${intToIp(network)}/${prefix}`,
      `Netmask:    ${intToIp(mask)}`,
      `Broadcast:  ${intToIp(broadcast)}`,
      `Total IPs:  ${totalAddresses}`,
      `Usable:     ${usableHosts}`,
    ];
    if (usableHosts > 0) {
      lines.push(`First host: ${intToIp((network + 1) >>> 0)}`);
      lines.push(`Last host:  ${intToIp((broadcast - 1) >>> 0)}`);
    }
    return lines.join('\n');
  },
};
