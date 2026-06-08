import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { csvValidateLogic } from './logic';

export default function CsvValidate() {
  const { input, setInput, output } = useToolState(csvValidateLogic);
  return (
    <TwoPaneLayout
      left={<CodeEditor value={input} onChange={setInput} placeholder="a,b\n1,2" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
