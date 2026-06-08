import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { adler32Logic } from './logic';
export default function Adler32() {
  const { input, setInput, output, error } = useToolState(adler32Logic);
  return (
    <TwoPaneLayout error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Enter text to checksum..." />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />} />
  );
}
