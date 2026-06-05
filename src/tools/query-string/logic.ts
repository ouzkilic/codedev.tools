import type { ToolLogic } from '@/hooks/useToolState';

function queryToJson(input: string): string {
  const params = new URLSearchParams(input.trim().replace(/^[?&]/, ''));
  const obj: Record<string, string | string[]> = {};
  for (const [key, value] of params) {
    if (key in obj) obj[key] = ([] as string[]).concat(obj[key], value);
    else obj[key] = value;
  }
  return JSON.stringify(obj, null, 2);
}

function jsonToQuery(input: string): string {
  const obj = JSON.parse(input);
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('Input must be a JSON object of key/value pairs.');
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, String(v)));
    else params.append(key, String(value));
  }
  return params.toString();
}

export const queryStringLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'to-json',
      choices: [
        { value: 'to-json', label: 'Query → JSON' },
        { value: 'to-query', label: 'JSON → Query' },
      ],
    },
  ],
  transform(input, ctx) {
    return (ctx?.options.mode ?? 'to-json') === 'to-query' ? jsonToQuery(input) : queryToJson(input);
  },
};
