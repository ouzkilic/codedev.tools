import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { macFormatLogic } from './logic';

export default function MacFormat() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(macFormatLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="AA:BB:CC:DD:EE:FF" />}
      right={<CodeEditor value={output} readOnly placeholder="Reformatted MAC appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
