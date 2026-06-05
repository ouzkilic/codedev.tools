import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { jsonToJsonSchemaLogic } from './logic';

export default function JsonToJsonSchema() {
  const { input, setInput, output, error } = useToolState(jsonToJsonSchemaLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder='{ "id": 1, "name": "Ada" }' />}
      right={<CodeEditor value={output} readOnly />}
      actions={
        <>
          <CopyButton text={output} />
          <DownloadButton text={output} filename="schema.json" />
        </>
      }
    />
  );
}
