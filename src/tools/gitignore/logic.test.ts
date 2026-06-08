import { describe, expect, it } from 'vitest';
import { buildGitignore } from './logic';

describe('buildGitignore', () => {
  it('node template contains node_modules, dist and .env', () => {
    const out = buildGitignore({ template: 'node' });
    expect(out).toContain('node_modules');
    expect(out).toContain('dist');
    expect(out).toContain('.env');
  });

  it('python template contains __pycache__, *.pyc and .venv', () => {
    const out = buildGitignore({ template: 'python' });
    expect(out).toContain('__pycache__');
    expect(out).toContain('*.pyc');
    expect(out).toContain('.venv');
  });

  it('java template contains *.class and target/', () => {
    const out = buildGitignore({ template: 'java' });
    expect(out).toContain('*.class');
    expect(out).toContain('target/');
  });

  it('go template contains /bin/ and *.exe', () => {
    const out = buildGitignore({ template: 'go' });
    expect(out).toContain('/bin/');
    expect(out).toContain('*.exe');
  });

  it('rust template contains target and a Cargo.lock comment', () => {
    const out = buildGitignore({ template: 'rust' });
    expect(out).toContain('target');
    expect(out).toContain('Cargo.lock');
  });

  it('macos template contains .DS_Store', () => {
    const out = buildGitignore({ template: 'macos' });
    expect(out).toContain('.DS_Store');
  });

  it('defaults to node when template is missing', () => {
    const out = buildGitignore({});
    expect(out).toContain('node_modules');
  });
});
