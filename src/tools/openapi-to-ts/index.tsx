import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { openapiToTsLogic } from './logic';

export default function OpenapiToTs() {
  const { input, setInput, output, error } = useToolState(openapiToTsLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder='{"openapi":"3.0.0","components":{"schemas":{}}}'
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
