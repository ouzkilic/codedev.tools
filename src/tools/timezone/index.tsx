import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { timezoneLogic } from './logic';

export default function Timezone() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(timezoneLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={
        <CodeEditor value={input} onChange={setInput} placeholder="2024-01-01T12:00:00Z" />
      }
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
