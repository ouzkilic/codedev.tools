import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { jsonToZodLogic } from './logic';

export default function JsonToZod() {
  const { input, setInput, output, error } = useToolState(jsonToZodLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Paste JSON..." />}
      right={<CodeEditor value={output} readOnly />}
      actions={<><CopyButton text={output} /><DownloadButton text={output} filename="schema.ts" /></>}
    />
  );
}
