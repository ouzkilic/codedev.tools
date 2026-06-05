import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { colorConvertLogic } from './logic';

export default function ColorConvert() {
  const { input, setInput, output, error } = useToolState(colorConvertLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="#ff0000  or  rgb(255,0,0)" />}
      right={<CodeEditor value={output} readOnly placeholder="Color formats appear here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
