import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { timestampLogic } from './logic';

export default function Timestamp() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(timestampLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="1700000000" />}
      right={<CodeEditor value={output} readOnly placeholder="Conversion appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
