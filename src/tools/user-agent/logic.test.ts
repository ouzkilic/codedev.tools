import { describe, it, expect } from 'vitest';
import { userAgentLogic } from './logic';

const CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ANDROID =
  'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const FIREFOX =
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';

const ctx = { options: {}, secondary: '' };

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

  it('returns the five fixed labels in order', () => {
    const lines = userAgentLogic.transform(CHROME).split('\n');
    expect(lines).toHaveLength(5);
    expect(lines[0]).toMatch(/^Browser:\s/);
    expect(lines[1]).toMatch(/^Engine:\s/);
    expect(lines[2]).toMatch(/^OS:\s/);
    expect(lines[3]).toMatch(/^Device:\s/);
    expect(lines[4]).toMatch(/^CPU:\s/);
  });

  it('joins browser name and version with a space', () => {
    const out = userAgentLogic.transform(CHROME);
    expect(out).toMatch(/Browser:\s+Chrome 120\.0\.0\.0/);
  });

  it('detects engine and OS version for desktop Chrome', () => {
    const out = userAgentLogic.transform(CHROME);
    expect(out).toMatch(/Engine:\s+Blink/);
    expect(out).toMatch(/OS:\s+macOS 10\.15\.7/);
  });

  it('reports Apple Macintosh device for desktop Chrome', () => {
    const out = userAgentLogic.transform(CHROME);
    expect(out).toMatch(/Device:\s+Apple Macintosh/);
  });

  it('detects Android Samsung mobile device', () => {
    const out = userAgentLogic.transform(ANDROID);
    expect(out).toMatch(/OS:\s+Android 13/);
    expect(out).toMatch(/Device:\s+Samsung SM-S908B mobile/);
    expect(out).toMatch(/Engine:\s+Blink/);
  });

  it('detects Firefox on Linux with CPU architecture', () => {
    const out = userAgentLogic.transform(FIREFOX);
    expect(out).toMatch(/Browser:\s+Firefox 121\.0/);
    expect(out).toMatch(/Engine:\s+Gecko/);
    expect(out).toMatch(/CPU:\s+amd64/);
  });

  it('falls back to "desktop" device type when none detected', () => {
    // Firefox/Linux UA yields no device type -> join() appends the 'desktop' default.
    const out = userAgentLogic.transform(FIREFOX);
    expect(out).toMatch(/Device:\s+desktop/);
  });

  it('returns "(unknown)" for fields with no detected value', () => {
    const out = userAgentLogic.transform('completely unrecognizable token soup');
    const lines = out.split('\n');
    expect(lines[0]).toBe('Browser:  (unknown)');
    expect(lines[1]).toBe('Engine:   (unknown)');
    expect(lines[2]).toBe('OS:       (unknown)');
    // No vendor/model and no type -> falls back to literal 'desktop'.
    expect(lines[3]).toBe('Device:   desktop');
    expect(lines[4]).toBe('CPU:      (unknown)');
  });

  it('handles empty input without throwing', () => {
    const out = userAgentLogic.transform('');
    expect(out.split('\n')).toHaveLength(5);
    expect(out).toContain('(unknown)');
    expect(out).toMatch(/Device:\s+desktop/);
  });

  it('handles whitespace-only input the same as empty (trimmed)', () => {
    expect(userAgentLogic.transform('   \t  \n ')).toBe(userAgentLogic.transform(''));
  });

  it('trims surrounding whitespace before parsing', () => {
    const padded = `   ${CHROME}   `;
    expect(userAgentLogic.transform(padded)).toBe(userAgentLogic.transform(CHROME));
  });

  it('is idempotent for the same input', () => {
    expect(userAgentLogic.transform(IPHONE)).toBe(userAgentLogic.transform(IPHONE));
  });

  it('ignores the ToolContext argument (single-input transform)', () => {
    expect(userAgentLogic.transform(CHROME, ctx)).toBe(userAgentLogic.transform(CHROME));
  });

  it('does not throw on unicode / emoji input', () => {
    const out = userAgentLogic.transform('Mozilla/5.0 (🚀; émoji-OS café) Chrome/1.0');
    expect(out.split('\n')).toHaveLength(5);
    expect(typeof out).toBe('string');
  });

  it('handles very large input without throwing', () => {
    const big = CHROME + ' ' + 'x'.repeat(50000);
    const out = userAgentLogic.transform(big);
    expect(out).toContain('Chrome');
    expect(out.split('\n')).toHaveLength(5);
  });
});
