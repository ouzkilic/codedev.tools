import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { subnetLogic } from './logic';

export default function Subnet() {
  const { input, setInput, output, error } = useToolState(subnetLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="192.168.1.0/24" />}
      right={<CodeEditor value={output} readOnly placeholder="Subnet details…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
