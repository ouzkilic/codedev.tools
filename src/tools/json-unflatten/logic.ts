import type { ToolLogic } from '@/hooks/useToolState';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

// Splits a flat path like "a.b[0].c" into tokens: ['a','b',0,'c'].
function tokenize(path: string): (string | number)[] {
  const tokens: (string | number)[] = [];
  const re = /([^.[\]]+)|\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path)) !== null) {
    tokens.push(m[2] !== undefined ? Number(m[2]) : m[1]);
  }
  return tokens;
}

export const jsonUnflattenLogic: ToolLogic = {
  transform(input: string): string {
    const flat = JSON.parse(input);
    if (flat === null || typeof flat !== 'object' || Array.isArray(flat)) {
      throw new Error('Input must be a flat JSON object of path → value pairs.');
    }

    let root: Json | undefined;
    for (const [path, value] of Object.entries(flat as Record<string, Json>)) {
      const tokens = tokenize(path);
      if (tokens.length === 0) continue;
      if (root === undefined) root = typeof tokens[0] === 'number' ? [] : {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let cur: any = root;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (i === tokens.length - 1) {
          cur[token] = value;
        } else {
          const nextIsIndex = typeof tokens[i + 1] === 'number';
          if (cur[token] === undefined) cur[token] = nextIsIndex ? [] : {};
          cur = cur[token];
        }
      }
    }

    return JSON.stringify(root ?? {}, null, 2);
  },
};
