import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { useToolState } from '@/hooks/useToolState';
import { tomlFormatterLogic } from './logic';

export default function TomlFormatter() {
  const { input, setInput, output, error } = useToolState(tomlFormatterLogic);

  return (
    <TwoPaneLayout
      error={error}
      actions={<CopyButton text={output} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Paste TOML here..." />}
      right={<CodeEditor value={output} readOnly />}
    />
  );
}
