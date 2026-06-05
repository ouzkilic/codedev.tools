import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { regexTesterLogic } from './logic';

export default function RegexTester() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(regexTesterLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Test string to match against…" />}
      right={<CodeEditor value={output} readOnly placeholder="Matches appear here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
