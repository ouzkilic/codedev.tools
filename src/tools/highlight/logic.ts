import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

export const highlightLogic: AsyncToolLogic = {
  options: [
    {
      key: 'language',
      label: 'Language',
      type: 'select',
      default: 'auto',
      choices: [
        { value: 'auto', label: 'Auto-detect' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'json', label: 'JSON' },
        { value: 'html', label: 'HTML' },
        { value: 'xml', label: 'XML' },
        { value: 'css', label: 'CSS' },
        { value: 'python', label: 'Python' },
        { value: 'bash', label: 'Bash' },
        { value: 'sql', label: 'SQL' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'java', label: 'Java' },
      ],
    },
  ],
  async transform(input, ctx) {
    const hljs = (await import('highlight.js')).default;
    const lang = String(ctx?.options.language ?? 'auto');
    const res = lang === 'auto' ? hljs.highlightAuto(input) : hljs.highlight(input, { language: lang });
    return res.value;
  },
};
