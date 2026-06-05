import Papa from 'papaparse';
import type { ToolLogic } from '@/hooks/useToolState';

export const csvTsvLogic: ToolLogic = {
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'csv-to-tsv',
      choices: [
        { value: 'csv-to-tsv', label: 'CSV → TSV' },
        { value: 'tsv-to-csv', label: 'TSV → CSV' },
      ],
    },
  ],
  transform(input, ctx) {
    const tsvToCsv = (ctx?.options.mode ?? 'csv-to-tsv') === 'tsv-to-csv';
    const from = tsvToCsv ? '\t' : ',';
    const to = tsvToCsv ? ',' : '\t';

    const result = Papa.parse<string[]>(input.trim(), { delimiter: from, skipEmptyLines: true });
    const fatal = result.errors.filter((e) => e.type !== 'Delimiter');
    if (fatal.length > 0) throw new Error(fatal[0].message);

    return Papa.unparse(result.data, { delimiter: to }).replace(/\r\n/g, '\n');
  },
};
