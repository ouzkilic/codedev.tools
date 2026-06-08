import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { zodToJsonSchemaLogic } from './logic';

export default function ZodToJsonSchema() {
  const { input, setInput, output, error } = useToolState(zodToJsonSchemaLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder="z.object({ id: z.number(), name: z.string().optional() })"
        />
      }
      right={<CodeEditor value={output} readOnly />}
      actions={<><CopyButton text={output} /><DownloadButton text={output} filename="schema.json" /></>}
    />
  );
}
