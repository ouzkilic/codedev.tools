import { describe, it, expect } from 'vitest';
import { formatCode } from './logic';

describe('prettierFormat', () => {
  it('formats JavaScript', async () => {
    expect(await formatCode('const x={a:1,b:2}', 'javascript')).toBe('const x = { a: 1, b: 2 };\n');
  });
  it('formats CSS', async () => {
    expect(await formatCode('a{color:red}', 'css')).toBe('a {\n  color: red;\n}\n');
  });
  it('formats JSON', async () => {
    expect(await formatCode('{"a":1}', 'json')).toBe('{ "a": 1 }\n');
  });
  it('rejects invalid JavaScript', async () => {
    await expect(formatCode('const = =', 'javascript')).rejects.toThrow();
  });
});
