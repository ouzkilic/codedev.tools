import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { curlToCodeLogic } from './logic';

const POST_CURL =
  `curl -X POST https://api.example.com/x ` +
  `-H "Content-Type: application/json" ` +
  `-d '{"name":"codedev"}'`;

function run(input: string, mode: 'fetch' | 'axios' = 'fetch'): string {
  const ctx: ToolContext = { options: { mode }, secondary: '' };
  return curlToCodeLogic.transform(input, ctx);
}

describe('curlToCode — basics', () => {
  it('converts a POST curl to fetch with method, headers and body', () => {
    const out = run(POST_CURL, 'fetch');
    expect(out).toContain('fetch(');
    expect(out).toContain('method: "POST"');
    expect(out).toContain('Content-Type');
    expect(out).toContain('{"name":"codedev"}');
  });

  it('converts a POST curl to axios with url', () => {
    const out = run(POST_CURL, 'axios');
    expect(out).toContain('axios(');
    expect(out).toContain('url:');
    expect(out).toContain('https://api.example.com/x');
  });

  it('defaults to GET for a plain curl', () => {
    const out = run('curl https://x.com', 'fetch');
    expect(out).toContain('fetch(');
    expect(out).toContain('method: "GET"');
  });

  it('infers POST when a data flag is present without -X', () => {
    const out = run("curl https://x.com --data 'a=1'", 'fetch');
    expect(out).toContain('method: "POST"');
    expect(out).toContain('a=1');
  });
});

describe('curlToCode — options / mode branch', () => {
  it('defaults to fetch when mode option is missing', () => {
    const out = curlToCodeLogic.transform('curl https://x.com', { options: {}, secondary: '' });
    expect(out).toContain('fetch(');
  });

  it('defaults to fetch when ctx is omitted entirely', () => {
    const out = curlToCodeLogic.transform('curl https://x.com');
    expect(out).toContain('fetch(');
    expect(out).not.toContain('axios(');
  });

  it('treats any non-axios mode value as fetch', () => {
    const out = run('curl https://x.com', 'fetch');
    // an unknown mode should also fall through to fetch
    const out2 = curlToCodeLogic.transform('curl https://x.com', {
      options: { mode: 'something-else' },
      secondary: '',
    });
    expect(out).toContain('fetch(');
    expect(out2).toContain('fetch(');
  });

  it('exposes a mode select option with fetch and axios choices', () => {
    const opts = curlToCodeLogic.options ?? [];
    const mode = opts.find((o) => o.key === 'mode');
    expect(mode).toBeDefined();
    expect(mode?.type).toBe('select');
    expect(mode?.default).toBe('fetch');
    const values = (mode?.choices ?? []).map((c) => c.value).sort();
    expect(values).toEqual(['axios', 'fetch']);
  });

  it('axios lowercases the method', () => {
    const out = run('curl -X DELETE https://x.com', 'axios');
    expect(out).toContain('method: "delete"');
  });

  it('fetch keeps the method uppercase', () => {
    const out = run('curl -X delete https://x.com', 'fetch');
    expect(out).toContain('method: "DELETE"');
  });
});

describe('curlToCode — method parsing', () => {
  it('uppercases a lowercase -X method', () => {
    const out = run('curl -X put https://x.com', 'fetch');
    expect(out).toContain('method: "PUT"');
  });

  it('supports --request as a method alias', () => {
    const out = run('curl --request PATCH https://x.com', 'fetch');
    expect(out).toContain('method: "PATCH"');
  });

  it('explicit method overrides body-based inference', () => {
    const out = run("curl -X GET https://x.com -d 'a=1'", 'fetch');
    expect(out).toContain('method: "GET"');
    // body is still emitted because body !== null
    expect(out).toContain('a=1');
  });
});

describe('curlToCode — headers', () => {
  it('parses multiple headers', () => {
    const out = run(
      'curl https://x.com -H "Accept: application/json" -H "X-Token: abc123"',
      'fetch',
    );
    expect(out).toContain('"Accept": "application/json"');
    expect(out).toContain('"X-Token": "abc123"');
    expect(out).toContain('headers:');
  });

  it('supports --header alias and trims surrounding whitespace', () => {
    const out = run('curl https://x.com --header "  Foo  :   bar  "', 'fetch');
    expect(out).toContain('"Foo": "bar"');
  });

  it('keeps colons inside a header value (only splits on first colon)', () => {
    const out = run('curl https://x.com -H "X-Time: 12:30:00"', 'fetch');
    expect(out).toContain('"X-Time": "12:30:00"');
  });

  it('omits the headers block entirely when there are none', () => {
    const out = run('curl https://x.com', 'fetch');
    expect(out).not.toContain('headers:');
  });

  it('ignores a header with no colon', () => {
    const out = run('curl https://x.com -H "NoColonHere"', 'fetch');
    expect(out).not.toContain('headers:');
  });

  it('ignores a header with an empty name', () => {
    const out = run('curl https://x.com -H ": value"', 'fetch');
    expect(out).not.toContain('headers:');
  });

  it('allows an empty header value', () => {
    const out = run('curl https://x.com -H "X-Empty:"', 'fetch');
    expect(out).toContain('"X-Empty": ""');
  });
});

describe('curlToCode — body / data flags', () => {
  it('renders a simple body with backticks', () => {
    const out = run("curl https://x.com -d 'hello world'", 'fetch');
    expect(out).toContain('body: `hello world`');
  });

  it('uses data key for axios body', () => {
    const out = run("curl https://x.com -d 'a=1'", 'axios');
    expect(out).toContain('data: `a=1`');
    expect(out).not.toContain('body:');
  });

  it('accepts --data-raw / --data-binary / --data-ascii flags', () => {
    for (const flag of ['--data-raw', '--data-binary', '--data-ascii']) {
      const out = run(`curl https://x.com ${flag} 'payload'`, 'fetch');
      expect(out).toContain('body: `payload`');
      expect(out).toContain('method: "POST"');
    }
  });

  it('falls back to empty body string when a data flag has no following token', () => {
    const out = run('curl https://x.com -d', 'fetch');
    // body becomes '' (not null) -> emitted and method inferred POST
    expect(out).toContain('body: ``');
    expect(out).toContain('method: "POST"');
  });

  it('JSON.stringifies a body containing a backtick', () => {
    const out = run('curl https://x.com -d "a`b"', 'fetch');
    expect(out).toContain('body: "a`b"');
  });

  it('JSON.stringifies a body containing a template placeholder ${', () => {
    const out = run('curl https://x.com -d "price ${x}"', 'fetch');
    expect(out).toContain('body: "price ${x}"');
    expect(out).not.toContain('body: `');
  });

  it('JSON.stringifies a body containing a backslash', () => {
    // single-quoted token preserves the backslash literally
    const out = run("curl https://x.com -d 'line\\nbreak'", 'fetch');
    expect(out).toContain('body: "line\\\\nbreak"');
  });
});

describe('curlToCode — tokenizer behavior', () => {
  it('handles line-continuation backslash + newline', () => {
    const input = "curl https://x.com \\\n  -H 'Accept: text/plain' \\\n  -d 'body'";
    const out = run(input, 'fetch');
    expect(out).toContain('https://x.com');
    expect(out).toContain('"Accept": "text/plain"');
    expect(out).toContain('body: `body`');
  });

  it('handles escaped double quote inside a double-quoted value', () => {
    const out = run('curl https://x.com -d "say \\"hi\\""', 'fetch');
    // body content is: say "hi"  -> no backtick/${/backslash so backtick literal
    expect(out).toContain('body: `say "hi"`');
  });

  it('does not process escapes inside single quotes', () => {
    const out = run("curl https://x.com -H 'X-A: a\\b'", 'fetch');
    expect(out).toContain('"X-A": "a\\\\b"');
  });

  it('picks the first non-flag token as the URL', () => {
    const out = run('curl https://first.com https://second.com', 'fetch');
    expect(out).toContain('"https://first.com"');
    expect(out).not.toContain('second.com');
  });

  it('ignores unknown flags like -L and --compressed', () => {
    const out = run('curl -L --compressed https://x.com', 'fetch');
    expect(out).toContain('"https://x.com"');
    expect(out).toContain('method: "GET"');
  });

  it('handles a curl command without the leading curl token', () => {
    const out = run('https://x.com -X POST', 'fetch');
    expect(out).toContain('"https://x.com"');
    expect(out).toContain('method: "POST"');
  });
});

describe('curlToCode — unicode / special content', () => {
  it('preserves emoji and unicode in the body', () => {
    const out = run("curl https://x.com -d 'héllo 🚀 世界'", 'fetch');
    expect(out).toContain('héllo 🚀 世界');
  });

  it('preserves unicode in header values', () => {
    const out = run('curl https://x.com -H "X-Name: café"', 'fetch');
    expect(out).toContain('"X-Name": "café"');
  });

  it('escapes a URL that needs JSON escaping', () => {
    const out = run('curl "https://x.com/path?q=a&b=c"', 'fetch');
    expect(out).toContain('"https://x.com/path?q=a&b=c"');
  });
});

describe('curlToCode — error paths', () => {
  it('throws when no URL is present', () => {
    expect(() => run('curl -X POST', 'fetch')).toThrow(/No URL/i);
  });

  it('throws on empty input', () => {
    expect(() => run('', 'fetch')).toThrow();
  });

  it('throws on whitespace-only input', () => {
    expect(() => run('   \n\t  ', 'fetch')).toThrow();
  });

  it('throws on just the curl keyword with no url', () => {
    expect(() => run('curl', 'fetch')).toThrow(/No URL/i);
  });
});

describe('curlToCode — structure / determinism', () => {
  it('is deterministic for the same input', () => {
    expect(run(POST_CURL, 'fetch')).toBe(run(POST_CURL, 'fetch'));
    expect(run(POST_CURL, 'axios')).toBe(run(POST_CURL, 'axios'));
  });

  it('produces a fetch call ending with a trailing semicolon and brace', () => {
    const out = run('curl https://x.com', 'fetch');
    expect(out.startsWith('fetch(')).toBe(true);
    expect(out.trimEnd().endsWith('});')).toBe(true);
  });

  it('produces an axios call wrapping a single object argument', () => {
    const out = run('curl https://x.com', 'axios');
    expect(out.startsWith('axios({')).toBe(true);
    expect(out.trimEnd().endsWith('});')).toBe(true);
    expect(out).toContain('url: "https://x.com"');
  });

  it('handles a large input without crashing', () => {
    const big = 'x'.repeat(20000);
    const out = run(`curl https://x.com -d '${big}'`, 'fetch');
    expect(out).toContain(big);
    expect(out).toContain('method: "POST"');
  });
});
