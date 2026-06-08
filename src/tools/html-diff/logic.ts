import { diffLines, type Change } from 'diff';

function normalize(s: string): string {
  return s.replace(/>\s*</g, '>\n<').trim();
}

export function computeHtmlDiff(left: string, right: string): Change[] {
  return diffLines(normalize(left) + '\n', normalize(right) + '\n');
}
