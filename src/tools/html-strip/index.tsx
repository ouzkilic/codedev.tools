import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { htmlStripLogic } from './logic';

export default function HtmlStrip() {
  const { input, setInput, output, error } = useToolState(htmlStripLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Paste HTML here..." />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
