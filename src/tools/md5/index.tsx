import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { md5Logic } from './logic';

export default function Md5() {
  const { input, setInput, output, error } = useToolState(md5Logic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Text to hash…" />}
      right={<CodeEditor value={output} readOnly placeholder="MD5 appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
