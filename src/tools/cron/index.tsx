import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { cronLogic } from './logic';

export default function Cron() {
  const { input, setInput, output, error } = useToolState(cronLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="*/5 * * * *" />}
      right={<CodeEditor value={output} readOnly placeholder="Explanation appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
