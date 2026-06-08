import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { keycodeLogic } from './logic';
export default function Keycode() {
  const { input, setInput, output, error } = useToolState(keycodeLogic);
  return (
    <TwoPaneLayout error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Enter a key (e.g. Enter, a, Space)..." />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />} />
  );
}
