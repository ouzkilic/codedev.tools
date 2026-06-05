import { format } from 'sql-formatter';
import type { ToolLogic } from '@/hooks/useToolState';

const DIALECTS = ['sql', 'postgresql', 'mysql', 'sqlite', 'mariadb', 'bigquery'] as const;

export const sqlFormatterLogic: ToolLogic = {
  options: [
    {
      key: 'dialect',
      label: 'Dialect',
      type: 'select',
      default: 'sql',
      choices: DIALECTS.map((d) => ({ value: d, label: d })),
    },
  ],
  transform(input, ctx) {
    const dialect = String(ctx?.options.dialect ?? 'sql');
    const language = (DIALECTS as readonly string[]).includes(dialect) ? dialect : 'sql';
    return format(input, {
      language: language as (typeof DIALECTS)[number],
      keywordCase: 'upper',
    });
  },
};
