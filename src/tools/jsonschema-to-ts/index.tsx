import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { jsonSchemaToTsLogic } from './logic';

export default function JsonSchemaToTs() {
  const { input, setInput, output, error } = useToolState(jsonSchemaToTsLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder='{"type":"object","properties":{"id":{"type":"integer"}}}'
        />
      }
      right={<CodeEditor value={output} readOnly />}
      actions={
        <>
          <CopyButton text={output} />
          <DownloadButton text={output} filename="types.ts" />
        </>
      }
    />
  );
}
