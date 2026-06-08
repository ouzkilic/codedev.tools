import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { jsonSchemaToJsonLogic } from './logic';

export default function JsonSchemaToJson() {
  const { input, setInput, output, error } = useToolState(jsonSchemaToJsonLogic);

  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Paste JSON Schema..." />}
      right={<CodeEditor value={output} readOnly placeholder="Sample JSON..." />}
      actions={<CopyButton text={output} />}
    />
  );
}
