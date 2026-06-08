import { useAsyncToolState } from '@/hooks/useAsyncToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { asciiArtLogic } from './logic';

export default function AsciiArt() {
  const { input, setInput, output, error } = useAsyncToolState(asciiArtLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Text to render…" />}
      right={<CodeEditor value={output} readOnly placeholder="ASCII art…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
