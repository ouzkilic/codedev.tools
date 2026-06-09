import { describe, it, expect } from 'vitest';
import type { ToolContext } from '@/hooks/useToolState';
import { padTruncateLogic } from './logic';

function run(
  input: string,
  options: Record<string, string>,
  secondary = '',
): string {
  const ctx: ToolContext = { options, secondary };
  return padTruncateLogic.transform(input, ctx);
}

describe('padTruncateLogic options metadata', () => {
  it('exposes the four expected option keys with defaults', () => {
    const keys = (padTruncateLogic.options ?? []).map((o) => o.key);
    expect(keys).toEqual(['width', 'char', 'side', 'mode']);
  });

  it('declares default width 10, char space, side end, mode pad', () => {
    const byKey = Object.fromEntries(
      (padTruncateLogic.options ?? []).map((o) => [o.key, o.default]),
    );
    expect(byKey.width).toBe('10');
    expect(byKey.char).toBe(' ');
    expect(byKey.side).toBe('end');
    expect(byKey.mode).toBe('pad');
  });

  it('side select offers start and end choices', () => {
    const side = (padTruncateLogic.options ?? []).find((o) => o.key === 'side');
    expect(side?.choices?.map((c) => c.value)).toEqual(['start', 'end']);
  });

  it('mode select offers pad, truncate and both choices', () => {
    const mode = (padTruncateLogic.options ?? []).find((o) => o.key === 'mode');
    expect(mode?.choices?.map((c) => c.value)).toEqual([
      'pad',
      'truncate',
      'both',
    ]);
  });
});

describe('padTruncateLogic pad mode', () => {
  it('pads end with given char', () => {
    expect(run('ab', { width: '5', char: '*', side: 'end', mode: 'pad' })).toBe(
      'ab***',
    );
  });

  it('pads start with given char', () => {
    expect(
      run('ab', { width: '5', char: '*', side: 'start', mode: 'pad' }),
    ).toBe('***ab');
  });

  it('pads with spaces by default char', () => {
    expect(run('ab', { width: '4', char: ' ', side: 'end', mode: 'pad' })).toBe(
      'ab  ',
    );
  });

  it('leaves input untouched when already at or over width (pad does not truncate)', () => {
    expect(
      run('abcdef', { width: '3', char: '*', side: 'end', mode: 'pad' }),
    ).toBe('abcdef');
    expect(
      run('abc', { width: '3', char: '*', side: 'start', mode: 'pad' }),
    ).toBe('abc');
  });

  it('uses only the first character of a multi-char pad string', () => {
    expect(
      run('x', { width: '4', char: 'abc', side: 'end', mode: 'pad' }),
    ).toBe('xaaa');
  });

  it('falls back to a space when pad char is empty', () => {
    expect(run('x', { width: '3', char: '', side: 'end', mode: 'pad' })).toBe(
      'x  ',
    );
  });

  it('pads an empty line up to the full width', () => {
    expect(run('', { width: '3', char: '-', side: 'end', mode: 'pad' })).toBe(
      '---',
    );
  });
});

describe('padTruncateLogic truncate mode', () => {
  it('truncates to width', () => {
    expect(
      run('abcdef', { width: '3', char: ' ', side: 'end', mode: 'truncate' }),
    ).toBe('abc');
  });

  it('leaves a string shorter than width unchanged (no padding in truncate mode)', () => {
    expect(
      run('ab', { width: '5', char: '*', side: 'end', mode: 'truncate' }),
    ).toBe('ab');
  });

  it('truncation ignores the side option', () => {
    expect(
      run('abcdef', { width: '3', char: ' ', side: 'start', mode: 'truncate' }),
    ).toBe('abc');
  });

  it('truncating to width 0 yields an empty string', () => {
    expect(
      run('hello', { width: '0', char: ' ', side: 'end', mode: 'truncate' }),
    ).toBe('');
  });
});

describe('padTruncateLogic both mode', () => {
  it('truncates then pads, here only truncation visible', () => {
    expect(
      run('abcdef', { width: '4', char: '-', side: 'end', mode: 'both' }),
    ).toBe('abcd');
  });

  it('normalizes both short and long lines to the exact width', () => {
    const out = run('ab\nabcdef', {
      width: '4',
      char: '.',
      side: 'end',
      mode: 'both',
    });
    expect(out).toBe('ab..\nabcd');
    for (const line of out.split('\n')) {
      expect(line.length).toBe(4);
    }
  });

  it('pads at start after truncation when side is start', () => {
    expect(run('xy', { width: '5', char: '0', side: 'start', mode: 'both' })).toBe(
      '000xy',
    );
  });
});

describe('padTruncateLogic multi-line handling', () => {
  it('applies per line for multi-line input', () => {
    expect(
      run('ab\nc', { width: '4', char: '.', side: 'end', mode: 'pad' }),
    ).toBe('ab..\nc...');
  });

  it('preserves the number of lines including trailing newline', () => {
    const out = run('a\nb\n', {
      width: '2',
      char: '_',
      side: 'end',
      mode: 'pad',
    });
    expect(out).toBe('a_\nb_\n__');
    expect(out.split('\n')).toHaveLength(3);
  });

  it('handles leading empty lines', () => {
    expect(run('\nx', { width: '2', char: '#', side: 'end', mode: 'pad' })).toBe(
      '##\nx#',
    );
  });
});

describe('padTruncateLogic width clamping', () => {
  it('clamps invalid width to 0 producing empty truncation', () => {
    expect(
      run('hello', { width: 'xyz', char: ' ', side: 'end', mode: 'truncate' }),
    ).toBe('');
  });

  it('clamps non-numeric width to 0 in pad mode (no padding, input unchanged)', () => {
    expect(
      run('hi', { width: 'xyz', char: '*', side: 'end', mode: 'pad' }),
    ).toBe('hi');
  });

  it('parses a leading-numeric width like parseInt does', () => {
    expect(run('a', { width: '5px', char: '-', side: 'end', mode: 'pad' })).toBe(
      'a----',
    );
  });

  it('clamps negative width up to 0', () => {
    expect(
      run('hello', { width: '-3', char: ' ', side: 'end', mode: 'truncate' }),
    ).toBe('');
  });

  it('clamps width above 1000 down to 1000', () => {
    const out = run('a', { width: '5000', char: 'x', side: 'end', mode: 'pad' });
    expect(out).toHaveLength(1000);
    expect(out.startsWith('a')).toBe(true);
    expect(out.endsWith('x')).toBe(true);
  });

  it('defaults width to 10 when option is missing', () => {
    expect(run('ab', { char: '-', side: 'end', mode: 'pad' })).toBe(
      'ab--------',
    );
  });
});

describe('padTruncateLogic default ctx fallbacks', () => {
  it('uses all defaults when options object is empty', () => {
    // width 10, char ' ', side 'end', mode 'pad'
    expect(run('ab', {})).toBe('ab        ');
  });

  it('handles an entirely empty input string with defaults (pad)', () => {
    expect(run('', {})).toBe('          ');
  });
});

describe('padTruncateLogic unicode and special characters', () => {
  it('pads using a unicode pad character', () => {
    expect(run('hi', { width: '4', char: '✓', side: 'end', mode: 'pad' })).toBe(
      'hi✓✓',
    );
  });

  it('treats width in terms of UTF-16 code units for truncation', () => {
    // '😀' is a surrogate pair (length 2); slicing to width 1 splits it.
    const out = run('😀x', {
      width: '1',
      char: ' ',
      side: 'end',
      mode: 'truncate',
    });
    expect(out).toHaveLength(1);
    expect(out).toBe('😀x'.slice(0, 1));
  });

  it('preserves embedded special characters when padding', () => {
    expect(run('a\tb', { width: '5', char: '.', side: 'end', mode: 'pad' })).toBe(
      'a\tb..',
    );
  });
});

describe('padTruncateLogic determinism', () => {
  it('produces identical output across repeated calls', () => {
    const opts = { width: '6', char: '*', side: 'start', mode: 'both' };
    const a = run('input', opts);
    const b = run('input', opts);
    expect(a).toBe(b);
  });

  it('pad mode is idempotent once at target width', () => {
    const opts = { width: '5', char: 'x', side: 'end', mode: 'pad' };
    const once = run('ab', opts);
    const twice = run(once, opts);
    expect(twice).toBe(once);
  });

  it('both mode is idempotent (output already exactly width)', () => {
    const opts = { width: '4', char: '0', side: 'start', mode: 'both' };
    const once = run('xy', opts);
    const twice = run(once, opts);
    expect(once).toBe(twice);
    expect(once).toHaveLength(4);
  });
});

describe('padTruncateLogic large input', () => {
  it('processes a large multi-line input padding each line to width', () => {
    const lines = Array.from({ length: 500 }, (_, i) => String(i));
    const out = run(lines.join('\n'), {
      width: '8',
      char: '.',
      side: 'end',
      mode: 'pad',
    });
    const outLines = out.split('\n');
    expect(outLines).toHaveLength(500);
    for (const l of outLines) {
      expect(l.length).toBe(8);
    }
  });
});
