import { describe, it, expect } from 'vitest';
import { keycodeLogic } from './logic';

describe('keycodeLogic', () => {
  it('maps Enter to keyCode 13', () => {
    expect(keycodeLogic.transform('Enter')).toContain('keyCode: 13');
  });
  it('maps a to keyCode 65', () => {
    expect(keycodeLogic.transform('a')).toContain('keyCode: 65');
  });
  it('maps Space to keyCode 32', () => {
    expect(keycodeLogic.transform('Space')).toContain('keyCode: 32');
  });
  it('maps 5 to keyCode 53', () => {
    expect(keycodeLogic.transform('5')).toContain('keyCode: 53');
  });
});
