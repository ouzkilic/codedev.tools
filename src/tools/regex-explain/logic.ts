import type { ToolLogic } from '@/hooks/useToolState';

export interface RegexToken {
  token: string;
  explanation: string;
}

const escapeMap: Record<string, string> = {
  d: 'a digit',
  D: 'a non-digit',
  w: 'a word char',
  W: 'a non-word char',
  s: 'a whitespace',
  S: 'a non-whitespace',
  b: 'a word boundary',
};

const simpleMap: Record<string, string> = {
  '.': 'any char',
  '^': 'start of string/line',
  $: 'end of string/line',
  '*': 'zero or more',
  '+': 'one or more',
  '?': 'zero or one / optional',
  '|': 'alternation',
};

/** Walk the pattern and return one token/explanation pair per recognized element. */
export function explainRegex(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i];

    if (ch === '\\') {
      const next = pattern[i + 1];
      if (next === undefined) {
        tokens.push({ token: '\\', explanation: 'a trailing backslash' });
        i += 1;
        continue;
      }
      const known = escapeMap[next];
      if (known) {
        tokens.push({ token: `\\${next}`, explanation: known });
      } else {
        tokens.push({ token: `\\${next}`, explanation: `literal "${next}"` });
      }
      i += 2;
      continue;
    }

    if (ch === '[') {
      let j = i + 1;
      while (j < pattern.length && pattern[j] !== ']') {
        if (pattern[j] === '\\') j += 1;
        j += 1;
      }
      const close = j < pattern.length ? j : pattern.length - 1;
      const body = pattern.slice(i, close + 1);
      const negated = pattern[i + 1] === '^';
      tokens.push({
        token: body,
        explanation: negated ? 'a negated character set' : 'a character set',
      });
      i = close + 1;
      continue;
    }

    if (ch === '(') {
      if (pattern.slice(i, i + 3) === '(?:') {
        tokens.push({ token: '(?:', explanation: 'start of a non-capturing group' });
        i += 3;
      } else {
        tokens.push({ token: '(', explanation: 'start of a group' });
        i += 1;
      }
      continue;
    }

    if (ch === ')') {
      tokens.push({ token: ')', explanation: 'end of a group' });
      i += 1;
      continue;
    }

    if (ch === '{') {
      const end = pattern.indexOf('}', i);
      if (end !== -1) {
        const body = pattern.slice(i, end + 1);
        const inner = pattern.slice(i + 1, end);
        if (/^\d+$/.test(inner)) {
          tokens.push({ token: body, explanation: `exactly ${inner}` });
        } else if (/^\d+,\d+$/.test(inner)) {
          const [n, m] = inner.split(',');
          tokens.push({ token: body, explanation: `${n} to ${m} times` });
        } else if (/^\d+,$/.test(inner)) {
          tokens.push({ token: body, explanation: `${inner.replace(',', '')} or more` });
        } else {
          tokens.push({ token: body, explanation: 'a quantifier' });
        }
        i = end + 1;
        continue;
      }
    }

    const simple = simpleMap[ch];
    if (simple) {
      tokens.push({ token: ch, explanation: simple });
      i += 1;
      continue;
    }

    tokens.push({ token: ch, explanation: `literal "${ch}"` });
    i += 1;
  }

  return tokens;
}

export const regexExplainLogic: ToolLogic = {
  transform(input): string {
    if (!input.trim()) throw new Error('Enter a regular expression to explain.');
    try {
      const tokens = explainRegex(input);
      return tokens.map((t) => `${t.token}  ->  ${t.explanation}`).join('\n');
    } catch (e) {
      throw new Error('Failed to explain regular expression.', { cause: e });
    }
  },
};
