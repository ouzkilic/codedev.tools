import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { textStatsLogic } from './logic';

export default function TextStats() {
  const { input, setInput, output, error } = useToolState(textStatsLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Paste text to count…" />}
      right={<CodeEditor value={output} readOnly placeholder="Counts appear here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
