import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { xmlToYamlLogic } from './logic';

export default function XmlToYaml() {
  const { input, setInput, output } = useToolState(xmlToYamlLogic);
  return (
    <TwoPaneLayout
      left={<CodeEditor value={input} onChange={setInput} />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
