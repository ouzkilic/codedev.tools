import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { tsToZodLogic } from './logic';

export default function TsToZod() {
  const { input, setInput, output, error } = useToolState(tsToZodLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="interface User { id: number; name?: string; }" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<><CopyButton text={output} /><DownloadButton text={output} filename="schema.ts" /></>}
    />
  );
}
