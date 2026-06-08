import { describe, it, expect } from 'vitest';
import { basicAuthLogic } from './logic';

const build = (user: string, pass: string) =>
  basicAuthLogic.transform(user, { options: {}, secondary: pass });

describe('basicAuth', () => {
  it('builds the standard example header', () => {
    expect(build('aladdin', 'opensesame')).toBe('Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l');
  });
  it('works with an empty password', () => {
    expect(build('user', '')).toBe('Authorization: Basic ' + btoa('user:'));
  });
});
