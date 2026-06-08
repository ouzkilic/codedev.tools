import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ipConvertLogic } from './logic';

export default function IpConvert() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(ipConvertLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="192.168.1.1  or  3232235777" />}
      right={<CodeEditor value={output} readOnly placeholder="Result appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
