import Papa from 'papaparse';
import { diffLines, type Change } from 'diff';

function normalize(s: string): string {
  return Papa.unparse(
    Papa.parse(s.trim(), { skipEmptyLines: true }).data,
  ).replace(/\r\n/g, '\n');
}

export function computeCsvDiff(left: string, right: string): Change[] {
  return diffLines(normalize(left) + '\n', normalize(right) + '\n');
}
