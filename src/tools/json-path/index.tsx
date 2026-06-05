import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { jsonPathLogic } from './logic';

export default function JsonPath() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(jsonPathLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder='{ "items": [ { "id": 1 } ] }' />}
      right={<CodeEditor value={output} readOnly placeholder="Matches…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
