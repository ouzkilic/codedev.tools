import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { numberToWordsLogic } from './logic';
export default function NumberToWords() {
  const { input, setInput, output, error } = useToolState(numberToWordsLogic);
  return (
    <TwoPaneLayout error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="42" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />} />
  );
}
