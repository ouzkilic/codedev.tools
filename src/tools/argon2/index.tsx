import { useAsyncToolState } from '@/hooks/useAsyncToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { argon2Logic } from './logic';

export default function Argon2() {
  const { input, setInput, output, error } = useAsyncToolState(argon2Logic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Password to hash…" />}
      right={<CodeEditor value={output} readOnly placeholder="Argon2id hash…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
