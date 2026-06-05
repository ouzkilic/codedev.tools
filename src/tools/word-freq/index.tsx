import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { wordFreqLogic } from './logic';

export default function WordFreq() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(wordFreqLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Paste text to analyze…" />}
      right={<CodeEditor value={output} readOnly placeholder="count  word" />}
      actions={<CopyButton text={output} />}
    />
  );
}
