import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { csvViewerLogic } from './logic';
export default function CsvViewer() {
  const { input, setInput, output, error } = useToolState(csvViewerLogic);
  return (
    <TwoPaneLayout error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="a,bb&#10;1,2" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<><CopyButton text={output} /><DownloadButton text={output} filename="table.txt" /></>} />
  );
}
