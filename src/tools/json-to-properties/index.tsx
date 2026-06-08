import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { jsonToPropertiesLogic } from './logic';

export default function JsonToProperties() {
  const { input, setInput, output, error } = useToolState(jsonToPropertiesLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder={'{\n  "server": { "port": 8080 }\n}'}
        />
      }
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
