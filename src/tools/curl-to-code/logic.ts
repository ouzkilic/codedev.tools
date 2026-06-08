import type { ToolLogic } from '@/hooks/useToolState';

interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

/** Tokenize a shell-ish command respecting single and double quotes. */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let started = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else if (ch === '\\' && quote === '"' && i + 1 < input.length) {
        i += 1;
        current += input[i];
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      started = true;
      continue;
    }
    if (ch === '\\' && i + 1 < input.length && (input[i + 1] === '\n' || input[i + 1] === '\r')) {
      i += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      if (started) {
        tokens.push(current);
        current = '';
        started = false;
      }
      continue;
    }
    current += ch;
    started = true;
  }
  if (started) tokens.push(current);
  return tokens;
}

const DATA_FLAGS = new Set(['-d', '--data', '--data-raw', '--data-binary', '--data-ascii']);

function parseCurl(input: string): ParsedCurl {
  const tokens = tokenize(input.trim());
  let url = '';
  let method = '';
  let body: string | null = null;
  const headers: Record<string, string> = {};

  for (let i = 0; i < tokens.length; i += 1) {
    const tok = tokens[i];
    if (tok === 'curl') continue;

    if (tok === '-X' || tok === '--request') {
      method = tokens[i + 1] ?? method;
      i += 1;
      continue;
    }
    if (tok === '-H' || tok === '--header') {
      const value = tokens[i + 1];
      i += 1;
      if (value) {
        const idx = value.indexOf(':');
        if (idx !== -1) {
          const name = value.slice(0, idx).trim();
          const val = value.slice(idx + 1).trim();
          if (name) headers[name] = val;
        }
      }
      continue;
    }
    if (DATA_FLAGS.has(tok)) {
      body = tokens[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (tok.startsWith('-')) {
      continue;
    }
    if (!url) url = tok;
  }

  if (!method) method = body !== null ? 'POST' : 'GET';

  if (!url) throw new Error('No URL found in curl command.');

  return { url, method: method.toUpperCase(), headers, body };
}

function indentBlock(record: Record<string, string>): string {
  const entries = Object.entries(record).map(
    ([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`,
  );
  return `{\n${entries.join(',\n')}\n  }`;
}

/** Render a body as a JS string literal, preferring backticks so the raw text stays readable. */
function bodyLiteral(body: string): string {
  if (!body.includes('`') && !body.includes('${') && !body.includes('\\')) {
    return `\`${body}\``;
  }
  return JSON.stringify(body);
}

function toFetch(parsed: ParsedCurl): string {
  const lines: string[] = [`method: ${JSON.stringify(parsed.method)}`];
  if (Object.keys(parsed.headers).length > 0) {
    lines.push(`headers: ${indentBlock(parsed.headers)}`);
  }
  if (parsed.body !== null) {
    lines.push(`body: ${bodyLiteral(parsed.body)}`);
  }
  return `fetch(${JSON.stringify(parsed.url)}, {\n  ${lines.join(',\n  ')},\n});`;
}

function toAxios(parsed: ParsedCurl): string {
  const lines: string[] = [
    `method: ${JSON.stringify(parsed.method.toLowerCase())}`,
    `url: ${JSON.stringify(parsed.url)}`,
  ];
  if (Object.keys(parsed.headers).length > 0) {
    lines.push(`headers: ${indentBlock(parsed.headers)}`);
  }
  if (parsed.body !== null) {
    lines.push(`data: ${bodyLiteral(parsed.body)}`);
  }
  return `axios({\n  ${lines.join(',\n  ')},\n});`;
}

export const curlToCodeLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Output',
      type: 'select',
      default: 'fetch',
      choices: [
        { value: 'fetch', label: 'fetch' },
        { value: 'axios', label: 'axios' },
      ],
    },
  ],
  transform(input, ctx): string {
    const mode = String(ctx?.options.mode ?? 'fetch');
    try {
      const parsed = parseCurl(input);
      return mode === 'axios' ? toAxios(parsed) : toFetch(parsed);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Failed to parse curl command.', {
        cause: e,
      });
    }
  },
};
