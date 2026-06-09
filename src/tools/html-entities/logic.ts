import type { ToolLogic } from '@/hooks/useToolState';

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
};

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

function unescapeHtml(input: string): string {
  return input.replace(/&(#[xX]?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    return body in NAMED ? NAMED[body] : match;
  });
}

export const htmlEntitiesLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'encode',
      choices: [
        { value: 'encode', label: 'Encode (escape)' },
        { value: 'decode', label: 'Decode (unescape)' },
      ],
    },
  ],
  transform(input: string, ctx): string {
    return (ctx?.options.mode ?? 'encode') === 'decode' ? unescapeHtml(input) : escapeHtml(input);
  },
};
