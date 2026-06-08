import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

export const jsonToTypesLogic: AsyncToolLogic = {
  options: [
    {
      key: 'lang',
      label: 'Language',
      type: 'select',
      default: 'go',
      choices: [
        { value: 'typescript', label: 'typescript' },
        { value: 'go', label: 'go' },
        { value: 'rust', label: 'rust' },
        { value: 'java', label: 'java' },
        { value: 'csharp', label: 'csharp' },
        { value: 'python', label: 'python' },
        { value: 'swift', label: 'swift' },
        { value: 'kotlin', label: 'kotlin' },
        { value: 'dart', label: 'dart' },
        { value: 'php', label: 'php' },
        { value: 'cpp', label: 'cpp' },
      ],
    },
  ],
  async transform(input, ctx) {
    const { quicktype, InputData, jsonInputForTargetLanguage } = await import('quicktype-core');
    const lang = String(ctx.options.lang ?? 'go');
    const jsonInput = jsonInputForTargetLanguage(
      lang as Parameters<typeof jsonInputForTargetLanguage>[0],
    );
    await jsonInput.addSource({ name: 'Root', samples: [input] });
    const inputData = new InputData();
    inputData.addInput(jsonInput);
    const result = await quicktype({
      inputData,
      lang: lang as Parameters<typeof quicktype>[0]['lang'],
      rendererOptions: { 'just-types': 'true' },
    });
    return result.lines.join('\n');
  },
};
