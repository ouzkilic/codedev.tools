import { describe, it, expect } from 'vitest';
import { csvTsvLogic } from './logic';

const csvToTsv = (s: string) => csvTsvLogic.transform(s, { options: { mode: 'csv-to-tsv' }, secondary: '' });
const tsvToCsv = (s: string) => csvTsvLogic.transform(s, { options: { mode: 'tsv-to-csv' }, secondary: '' });

describe('csvTsv', () => {
  it('converts CSV to TSV', () => {
    expect(csvToTsv('a,b\n1,2')).toBe('a\tb\n1\t2');
  });
  it('converts TSV to CSV', () => {
    expect(tsvToCsv('a\tb\n1\t2')).toBe('a,b\n1,2');
  });
  it('quotes CSV cells that contain the comma delimiter', () => {
    expect(tsvToCsv('a\tb\nx,y\t2')).toContain('"x,y"');
  });
});
