import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { csvTransposeLogic } from './logic';

export default function CsvTranspose() {
  const { input, setInput, output, error } = useToolState(csvTransposeLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="a,b\n1,2" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
