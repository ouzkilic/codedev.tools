import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { wordsToNumberLogic } from './logic';

export default function WordsToNumber() {
  const { input, setInput, output, error } = useToolState(wordsToNumberLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder="one thousand two hundred thirty-four"
        />
      }
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
