import { describe, it, expect } from 'vitest';
import { svgToJsxLogic } from './logic';

describe('svgToJsxLogic', () => {
  it('converts attribute names and class in jsx mode', () => {
    const out = svgToJsxLogic.transform(
      '<svg><path stroke-width="2" class="icon" /></svg>',
      { options: { mode: 'jsx' }, secondary: '' },
    );
    expect(out).toContain('strokeWidth="2"');
    expect(out).toContain('className="icon"');
  });

  it('produces a data URI in datauri mode', () => {
    const out = svgToJsxLogic.transform('<svg></svg>', {
      options: { mode: 'datauri' },
      secondary: '',
    });
    expect(out.startsWith('data:image/svg+xml,')).toBe(true);
  });
});
