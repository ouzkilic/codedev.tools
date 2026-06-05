import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { mimeTypesLogic } from './logic';

export default function MimeTypes() {
  const { input, setInput, output, error } = useToolState(mimeTypesLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="png  or  application/json" />}
      right={<CodeEditor value={output} readOnly placeholder="Matching MIME types…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
