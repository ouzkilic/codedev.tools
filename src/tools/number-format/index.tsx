import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { numberFormatLogic } from './logic';

export default function NumberFormat() {
  const { input, setInput, output, error, options, setOption, optionDefs } = useToolState(numberFormatLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="1234567.89" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
