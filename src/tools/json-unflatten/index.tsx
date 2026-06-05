import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { jsonUnflattenLogic } from './logic';

export default function JsonUnflatten() {
  const { input, setInput, output, error } = useToolState(jsonUnflattenLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder='{ "a.b[0]": 1, "a.b[1]": 2 }' />}
      right={<CodeEditor value={output} readOnly />}
      actions={
        <>
          <CopyButton text={output} />
          <DownloadButton text={output} filename="unflattened.json" />
        </>
      }
    />
  );
}
