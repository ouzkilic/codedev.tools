import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { sqlDdlToTsLogic } from './logic';

export default function SqlDdlToTs() {
  const { input, setInput, output, error } = useToolState(sqlDdlToTsLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder="CREATE TABLE users (id INT NOT NULL, name VARCHAR(50), active BOOLEAN)"
        />
      }
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
