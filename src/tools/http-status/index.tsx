import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { httpStatusLogic } from './logic';

export default function HttpStatus() {
  const { input, setInput, output, error } = useToolState(httpStatusLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="404  or  'not found'" />}
      right={<CodeEditor value={output} readOnly placeholder="Matching status codes…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
