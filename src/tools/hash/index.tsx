import { useAsyncToolState } from '@/hooks/useAsyncToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { hashLogic } from './logic';

export default function HashTool() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useAsyncToolState(hashLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Text to hash…" />}
      right={<CodeEditor value={output} readOnly placeholder="Hash appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
