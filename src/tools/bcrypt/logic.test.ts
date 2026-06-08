import { describe, expect, it } from 'vitest';
import { bcryptLogic } from './logic';

describe('bcryptLogic', () => {
  it('hashes a password to a bcrypt string', async () => {
    const out = await bcryptLogic.transform('pw', { options: { mode: 'hash', rounds: '8' }, secondary: '' });
    expect(out.startsWith('$2')).toBe(true);
  });

  it('verifies a matching password', async () => {
    const h = await bcryptLogic.transform('pw', { options: { mode: 'hash', rounds: '8' }, secondary: '' });
    expect(await bcryptLogic.transform('pw', { options: { mode: 'verify' }, secondary: h })).toBe('✓ Match');
  });

  it('rejects a wrong password', async () => {
    const h = await bcryptLogic.transform('pw', { options: { mode: 'hash', rounds: '8' }, secondary: '' });
    expect(await bcryptLogic.transform('nope', { options: { mode: 'verify' }, secondary: h })).toBe('✗ No match');
  });
});
