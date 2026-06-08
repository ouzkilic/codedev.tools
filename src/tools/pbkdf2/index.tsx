import { useAsyncToolState } from '@/hooks/useAsyncToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { pbkdf2Logic } from './logic';

export default function Pbkdf2() {
  const { input, setInput, output, error, options, setOption, optionDefs } = useAsyncToolState(pbkdf2Logic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Password…" />}
      right={<CodeEditor value={output} readOnly placeholder="Derived key (hex)…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
