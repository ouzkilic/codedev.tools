import { describe, it, expect } from 'vitest';
import { curlToCodeLogic } from './logic';

const POST_CURL =
  `curl -X POST https://api.example.com/x ` +
  `-H "Content-Type: application/json" ` +
  `-d '{"name":"codedev"}'`;

describe('curlToCode', () => {
  it('converts a POST curl to fetch with method, headers and body', () => {
    const out = curlToCodeLogic.transform(POST_CURL, { options: { mode: 'fetch' }, secondary: '' });
    expect(out).toContain('fetch(');
    expect(out).toContain('method: "POST"');
    expect(out).toContain('Content-Type');
    expect(out).toContain('{"name":"codedev"}');
  });

  it('converts a POST curl to axios with url', () => {
    const out = curlToCodeLogic.transform(POST_CURL, { options: { mode: 'axios' }, secondary: '' });
    expect(out).toContain('axios(');
    expect(out).toContain('url:');
    expect(out).toContain('https://api.example.com/x');
  });

  it('defaults to GET for a plain curl', () => {
    const out = curlToCodeLogic.transform('curl https://x.com', {
      options: { mode: 'fetch' },
      secondary: '',
    });
    expect(out).toContain('fetch(');
    expect(out).toContain('method: "GET"');
  });

  it('infers POST when a data flag is present without -X', () => {
    const out = curlToCodeLogic.transform("curl https://x.com --data 'a=1'", {
      options: { mode: 'fetch' },
      secondary: '',
    });
    expect(out).toContain('method: "POST"');
    expect(out).toContain('a=1');
  });
});
