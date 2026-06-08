import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { csvToHtmlLogic } from './logic';
export default function CsvToHtml() {
  const { input, setInput, output, error } = useToolState(csvToHtmlLogic);
  return (
    <TwoPaneLayout error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="a,b&#10;1,2" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />} />
  );
}
