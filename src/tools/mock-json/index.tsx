import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { mockJsonLogic } from './logic';

export default function MockJson() {
  const { input, setInput, output, error } = useToolState(mockJsonLogic);

  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Paste JSON Schema..." />}
      right={<CodeEditor value={output} readOnly placeholder="Mock JSON..." />}
      actions={<CopyButton text={output} />}
    />
  );
}
