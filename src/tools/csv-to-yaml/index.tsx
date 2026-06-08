import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { csvToYamlLogic } from './logic';

export default function CsvToYaml() {
  const { input, setInput, output, error } = useToolState(csvToYamlLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder={'name,age\nAda,36'} />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
