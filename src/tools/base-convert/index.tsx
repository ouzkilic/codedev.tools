import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { baseConvertLogic } from './logic';

export default function BaseConvert() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(baseConvertLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="255  or  0xff  or  0b1010" />}
      right={<CodeEditor value={output} readOnly placeholder="Conversions appear here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
