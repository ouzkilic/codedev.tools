import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

const PARSERS: Record<string, string> = {
  javascript: 'babel',
  typescript: 'typescript',
  json: 'json',
  css: 'css',
  scss: 'scss',
  less: 'less',
  html: 'html',
  markdown: 'markdown',
};

// Heavy lib: prettier + only the plugins each language needs, dynamically imported.
export async function formatCode(input: string, lang: string): Promise<string> {
  const parser = PARSERS[lang] ?? 'babel';
  const prettier = await import('prettier/standalone');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins: any[] = [];

  if (['javascript', 'typescript', 'json', 'html'].includes(lang)) {
    plugins.push((await import('prettier/plugins/babel')).default);
    plugins.push((await import('prettier/plugins/estree')).default);
  }
  if (lang === 'typescript') plugins.push((await import('prettier/plugins/typescript')).default);
  if (['css', 'scss', 'less', 'html'].includes(lang)) {
    plugins.push((await import('prettier/plugins/postcss')).default);
  }
  if (lang === 'html') plugins.push((await import('prettier/plugins/html')).default);
  if (lang === 'markdown') plugins.push((await import('prettier/plugins/markdown')).default);

  return prettier.format(input, { parser, plugins });
}

export const prettierFormatLogic: AsyncToolLogic = {
  options: [
    {
      key: 'lang',
      label: 'Language',
      type: 'select',
      default: 'javascript',
      choices: ['javascript', 'typescript', 'json', 'css', 'scss', 'less', 'html', 'markdown'].map(
        (l) => ({ value: l, label: l }),
      ),
    },
  ],
  transform(input, ctx) {
    return formatCode(input, String(ctx.options.lang ?? 'javascript'));
  },
};
