import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { userAgentLogic } from './logic';

export default function UserAgent() {
  const { input, setInput, output, error } = useToolState(userAgentLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Mozilla/5.0 (…) Chrome/120…" />}
      right={<CodeEditor value={output} readOnly placeholder="Parsed UA details…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
