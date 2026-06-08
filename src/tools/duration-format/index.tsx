import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { durationFormatLogic } from './logic';

export default function DurationFormat() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(durationFormatLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="3661 or 1h 1m 1s" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
