import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { jwtDecodeLogic } from './logic';

export default function JwtDecode() {
  const { input, setInput, output, error } = useToolState(jwtDecodeLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…" />}
      right={<CodeEditor value={output} readOnly placeholder="Decoded header + payload…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
