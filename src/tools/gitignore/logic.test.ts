import { describe, expect, it } from 'vitest';
import type { ToolOptions } from '@/hooks/useToolState';
import { buildGitignore, GITIGNORE_OPTIONS } from './logic';

describe('GITIGNORE_OPTIONS', () => {
  it('exposes a single template select option defaulting to node', () => {
    expect(GITIGNORE_OPTIONS).toHaveLength(1);
    const opt = GITIGNORE_OPTIONS[0];
    expect(opt.key).toBe('template');
    expect(opt.type).toBe('select');
    expect(opt.default).toBe('node');
  });

  it('lists exactly the six supported template choices', () => {
    const values = (GITIGNORE_OPTIONS[0].choices ?? []).map((c) => c.value);
    expect(values).toEqual(['node', 'python', 'java', 'go', 'rust', 'macos']);
  });

  it('produces a non-empty output for every advertised choice', () => {
    for (const choice of GITIGNORE_OPTIONS[0].choices ?? []) {
      const out = buildGitignore({ template: choice.value });
      expect(out.length).toBeGreaterThan(0);
    }
  });
});

describe('buildGitignore - node template', () => {
  it('contains dependencies, build, logs, env and misc entries', () => {
    const out = buildGitignore({ template: 'node' });
    expect(out).toContain('node_modules/');
    expect(out).toContain('dist/');
    expect(out).toContain('build/');
    expect(out).toContain('npm-debug.log*');
    expect(out).toContain('pnpm-debug.log*');
    expect(out).toContain('.env');
    expect(out).toContain('.env.local');
    expect(out).toContain('.env.*.local');
    expect(out).toContain('.DS_Store');
    expect(out).toContain('coverage/');
    expect(out).toContain('.cache/');
  });

  it('uses section comment headers', () => {
    const out = buildGitignore({ template: 'node' });
    expect(out).toContain('# Dependencies');
    expect(out).toContain('# Build output');
    expect(out).toContain('# Environment');
  });
});

describe('buildGitignore - python template', () => {
  it('contains bytecode, packaging, venv, env and coverage entries', () => {
    const out = buildGitignore({ template: 'python' });
    expect(out).toContain('__pycache__/');
    expect(out).toContain('*.py[cod]');
    expect(out).toContain('*.pyc');
    expect(out).toContain('*.egg-info/');
    expect(out).toContain('.venv');
    expect(out).toContain('venv/');
    expect(out).toContain('env/');
    expect(out).toContain('.pytest_cache/');
    expect(out).toContain('.coverage');
    expect(out).toContain('htmlcov/');
  });
});

describe('buildGitignore - java template', () => {
  it('contains class files, build dirs, packages, logs and IDE entries', () => {
    const out = buildGitignore({ template: 'java' });
    expect(out).toContain('*.class');
    expect(out).toContain('target/');
    expect(out).toContain('build/');
    expect(out).toContain('out/');
    expect(out).toContain('*.jar');
    expect(out).toContain('*.war');
    expect(out).toContain('*.ear');
    expect(out).toContain('*.log');
    expect(out).toContain('.idea/');
    expect(out).toContain('*.iml');
  });
});

describe('buildGitignore - go template', () => {
  it('contains binaries, test artifacts, vendor and workspace entries', () => {
    const out = buildGitignore({ template: 'go' });
    expect(out).toContain('/bin/');
    expect(out).toContain('*.exe');
    expect(out).toContain('*.dll');
    expect(out).toContain('*.so');
    expect(out).toContain('*.dylib');
    expect(out).toContain('*.test');
    expect(out).toContain('*.out');
    expect(out).toContain('coverage.txt');
    expect(out).toContain('vendor/');
    expect(out).toContain('go.work');
  });
});

describe('buildGitignore - rust template', () => {
  it('contains target, backup files and the Cargo.lock comment', () => {
    const out = buildGitignore({ template: 'rust' });
    expect(out).toContain('/target');
    expect(out).toContain('**/*.rs.bk');
    expect(out).toContain('# Cargo.lock');
  });
});

describe('buildGitignore - macos template', () => {
  it('contains general, thumbnail and volume-root entries', () => {
    const out = buildGitignore({ template: 'macos' });
    expect(out).toContain('.DS_Store');
    expect(out).toContain('.AppleDouble');
    expect(out).toContain('.LSOverride');
    expect(out).toContain('._*');
    expect(out).toContain('.DocumentRevisions-V100');
    expect(out).toContain('.fseventsd');
    expect(out).toContain('.Spotlight-V100');
    expect(out).toContain('.Trashes');
  });
});

describe('buildGitignore - defaulting & fallback', () => {
  it('defaults to node when template key is absent', () => {
    const out = buildGitignore({});
    expect(out).toBe(buildGitignore({ template: 'node' }));
  });

  it('defaults to node when template is undefined', () => {
    const out = buildGitignore({ template: undefined } as unknown as ToolOptions);
    expect(out).toBe(buildGitignore({ template: 'node' }));
  });

  it('defaults to node when template is null', () => {
    const out = buildGitignore({ template: null } as unknown as ToolOptions);
    expect(out).toBe(buildGitignore({ template: 'node' }));
  });

  it('falls back to node for an unknown template name', () => {
    const out = buildGitignore({ template: 'cobol' });
    expect(out).toBe(buildGitignore({ template: 'node' }));
  });

  it('falls back to node for an empty-string template', () => {
    const out = buildGitignore({ template: '' });
    expect(out).toBe(buildGitignore({ template: 'node' }));
  });

  it('falls back to node for a whitespace-only template', () => {
    const out = buildGitignore({ template: '   ' });
    expect(out).toBe(buildGitignore({ template: 'node' }));
  });

  it('is case-sensitive: uppercase template name falls back to node', () => {
    const out = buildGitignore({ template: 'PYTHON' });
    expect(out).toBe(buildGitignore({ template: 'node' }));
    expect(out).not.toBe(buildGitignore({ template: 'python' }));
  });

  it('stringifies a boolean template value and falls back to node', () => {
    expect(buildGitignore({ template: true })).toBe(buildGitignore({ template: 'node' }));
    expect(buildGitignore({ template: false })).toBe(buildGitignore({ template: 'node' }));
  });

  it('handles unicode / emoji template names by falling back to node', () => {
    expect(buildGitignore({ template: '🚀nodé' })).toBe(buildGitignore({ template: 'node' }));
  });
});

describe('buildGitignore - behavioural properties', () => {
  it('is deterministic: repeated calls return identical output', () => {
    expect(buildGitignore({ template: 'python' })).toBe(buildGitignore({ template: 'python' }));
  });

  it('ignores unrelated extra options', () => {
    const out = buildGitignore({ template: 'go', foo: 'bar', enabled: true });
    expect(out).toBe(buildGitignore({ template: 'go' }));
  });

  it('produces distinct output for distinct known templates', () => {
    const outputs = ['node', 'python', 'java', 'go', 'rust', 'macos'].map((t) =>
      buildGitignore({ template: t }),
    );
    const unique = new Set(outputs);
    expect(unique.size).toBe(outputs.length);
  });

  it('never throws for any input', () => {
    expect(() => buildGitignore({})).not.toThrow();
    expect(() => buildGitignore({ template: 'whatever' })).not.toThrow();
  });

  it('every line is a comment, blank, or pattern (no leading whitespace noise)', () => {
    const out = buildGitignore({ template: 'node' });
    for (const line of out.split('\n')) {
      expect(line).toBe(line.trim());
    }
  });
});
