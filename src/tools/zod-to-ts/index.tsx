import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { zodToTsLogic } from './logic';

export default function ZodToTs() {
  const { input, setInput, output, error } = useToolState(zodToTsLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Paste a Zod object schema..." />}
      right={<CodeEditor value={output} readOnly />}
      actions={<><CopyButton text={output} /><DownloadButton text={output} filename="types.ts" /></>}
    />
  );
}
