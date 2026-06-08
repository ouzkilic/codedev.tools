import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { xpathLogic } from './logic';

export default function Xpath() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(xpathLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="<books><book><title>A</title></book></books>" />}
      right={<CodeEditor value={output} readOnly placeholder="Matches…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
