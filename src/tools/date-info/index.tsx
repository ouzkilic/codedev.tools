import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { dateInfoLogic } from './logic';

export default function DateInfo() {
  const { input, setInput, output, error } = useToolState(dateInfoLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="2024-01-01" />}
      right={<CodeEditor value={output} readOnly placeholder="Date details…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
