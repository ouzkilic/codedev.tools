import { describe, it, expect } from 'vitest';
import { userAgentLogic } from './logic';

const CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

describe('userAgent', () => {
  it('detects browser and OS for desktop Chrome', () => {
    const out = userAgentLogic.transform(CHROME);
    expect(out).toContain('Chrome');
    expect(out).toMatch(/OS:\s+macOS/);
  });
  it('detects mobile Safari on iOS', () => {
    const out = userAgentLogic.transform(IPHONE);
    expect(out).toContain('Safari');
    expect(out).toMatch(/iOS/);
  });
});
