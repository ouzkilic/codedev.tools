import type { ToolLogic } from '@/hooks/useToolState';

export const urlParserLogic: ToolLogic = {
  transform(input: string): string {
    let url: URL;
    try {
      url = new URL(input.trim());
    } catch {
      throw new Error('Invalid URL (include the protocol, e.g. https://).');
    }

    const lines = [
      `Protocol:  ${url.protocol}`,
      `Host:      ${url.host}`,
      `Hostname:  ${url.hostname}`,
      `Port:      ${url.port || '(default)'}`,
      `Path:      ${url.pathname}`,
      `Search:    ${url.search || '(none)'}`,
      `Hash:      ${url.hash || '(none)'}`,
      `Origin:    ${url.origin}`,
    ];
    if (url.username) lines.push(`Username:  ${url.username}`);

    const params = [...url.searchParams];
    if (params.length > 0) {
      lines.push('', 'Query parameters:');
      for (const [key, value] of params) lines.push(`  ${key} = ${value}`);
    }
    return lines.join('\n');
  },
};
