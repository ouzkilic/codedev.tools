import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { sqlDdlToPrismaLogic } from './logic';

export default function SqlDdlToPrisma() {
  const { input, setInput, output, error } = useToolState(sqlDdlToPrismaLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder="CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50), active BOOLEAN)"
        />
      }
      right={<CodeEditor value={output} readOnly />}
      actions={
        <>
          <CopyButton text={output} />
          <DownloadButton text={output} filename="schema.prisma" />
        </>
      }
    />
  );
}
