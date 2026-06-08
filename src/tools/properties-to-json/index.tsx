import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { propertiesToJsonLogic } from './logic';

export default function PropertiesToJson() {
  const { input, setInput, output, error } = useToolState(propertiesToJsonLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="key=value" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
