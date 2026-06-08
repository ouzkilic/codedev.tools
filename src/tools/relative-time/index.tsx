import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { relativeTimeLogic } from './logic';

export default function RelativeTime() {
  const { input, setInput, output, error } = useToolState(relativeTimeLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="2024-01-01T00:00:00Z" />}
      right={<CodeEditor value={output} readOnly placeholder="Relative time appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
