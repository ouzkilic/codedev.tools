import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { cronNextLogic } from './logic';

export default function CronNext() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(cronNextLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="*/15 * * * *" />}
      right={<CodeEditor value={output} readOnly placeholder="Next run times appear here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
