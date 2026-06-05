import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { charInfoLogic } from './logic';

export default function CharInfo() {
  const { input, setInput, output, error } = useToolState(charInfoLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="A  or  65  or  0x41" />}
      right={<CodeEditor value={output} readOnly placeholder="Character details…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
