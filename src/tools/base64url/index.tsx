import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { base64urlLogic } from './logic';

export default function Base64Url() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(base64urlLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Enter text or Base64URL..." />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
