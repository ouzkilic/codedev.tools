import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { urlParserLogic } from './logic';

export default function UrlParser() {
  const { input, setInput, output, error } = useToolState(urlParserLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="https://example.com/path?x=1" />}
      right={<CodeEditor value={output} readOnly placeholder="URL components appear here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
