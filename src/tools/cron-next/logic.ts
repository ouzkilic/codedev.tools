import { CronExpressionParser } from 'cron-parser';
import type { ToolLogic } from '@/hooks/useToolState';

export function computeNextRuns(expr: string, count: number, from: Date): string[] {
  const interval = CronExpressionParser.parse(expr, { currentDate: from, tz: 'UTC' });
  const runs: string[] = [];
  for (let i = 0; i < count; i++) {
    runs.push(interval.next().toISOString() ?? '');
  }
  return runs;
}

export const cronNextLogic: ToolLogic = {
  options: [{ key: 'count', label: 'Count', type: 'text', placeholder: '5', default: '5' }],
  transform(input: string, ctx?): string {
    const countRaw = String(ctx?.options.count ?? '5');
    const parsed = parseInt(countRaw, 10) || 1;
    const count = Math.min(Math.max(parsed, 1), 50);
    const currentDate = new Date();
    try {
      return computeNextRuns(input.trim(), count, currentDate).join('\n');
    } catch (e) {
      throw new Error('Invalid cron expression.', { cause: e });
    }
  },
};
