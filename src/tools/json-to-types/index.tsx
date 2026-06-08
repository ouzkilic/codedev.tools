import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { useAsyncToolState } from '@/hooks/useAsyncToolState';
import { jsonToTypesLogic } from './logic';

export default function JsonToTypes() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useAsyncToolState(jsonToTypesLogic);

  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
