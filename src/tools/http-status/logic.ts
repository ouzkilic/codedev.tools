import type { ToolLogic } from '@/hooks/useToolState';

const STATUS: Record<string, string> = {
  '100': 'Continue', '101': 'Switching Protocols', '103': 'Early Hints',
  '200': 'OK', '201': 'Created', '202': 'Accepted', '204': 'No Content', '206': 'Partial Content',
  '301': 'Moved Permanently', '302': 'Found', '303': 'See Other', '304': 'Not Modified',
  '307': 'Temporary Redirect', '308': 'Permanent Redirect',
  '400': 'Bad Request', '401': 'Unauthorized', '402': 'Payment Required', '403': 'Forbidden',
  '404': 'Not Found', '405': 'Method Not Allowed', '406': 'Not Acceptable', '408': 'Request Timeout',
  '409': 'Conflict', '410': 'Gone', '413': 'Payload Too Large', '415': 'Unsupported Media Type',
  '418': "I'm a Teapot", '422': 'Unprocessable Entity', '429': 'Too Many Requests',
  '500': 'Internal Server Error', '501': 'Not Implemented', '502': 'Bad Gateway',
  '503': 'Service Unavailable', '504': 'Gateway Timeout', '511': 'Network Authentication Required',
};

export const httpStatusLogic: ToolLogic = {
  transform(input: string): string {
    const q = input.trim().toLowerCase();
    const entries = Object.entries(STATUS);
    const matches = /^\d+$/.test(q)
      ? entries.filter(([code]) => code === q || code.startsWith(q))
      : entries.filter(([code, text]) => text.toLowerCase().includes(q) || code.includes(q));
    if (matches.length === 0) throw new Error('No matching HTTP status code.');
    return matches.map(([code, text]) => `${code} ${text}`).join('\n');
  },
};
