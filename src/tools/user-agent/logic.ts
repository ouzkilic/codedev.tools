import { UAParser } from 'ua-parser-js';
import type { ToolLogic } from '@/hooks/useToolState';

export const userAgentLogic: ToolLogic = {
  transform(input: string): string {
    const r = new UAParser(input.trim()).getResult();
    const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ') || '(unknown)';
    return [
      `Browser:  ${join(r.browser.name, r.browser.version)}`,
      `Engine:   ${join(r.engine.name, r.engine.version)}`,
      `OS:       ${join(r.os.name, r.os.version)}`,
      `Device:   ${join(r.device.vendor, r.device.model, r.device.type ?? 'desktop')}`,
      `CPU:      ${join(r.cpu.architecture)}`,
    ].join('\n');
  },
};
