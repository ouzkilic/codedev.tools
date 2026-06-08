import { useAsyncToolState } from '@/hooks/useAsyncToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { highlightLogic } from './logic';

export default function Highlight() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useAsyncToolState(highlightLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Paste code…" />}
      right={<CodeEditor value={output} readOnly placeholder="Highlighted HTML…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
