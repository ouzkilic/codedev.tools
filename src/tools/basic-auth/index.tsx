import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { basicAuthLogic } from './logic';

export default function BasicAuth() {
  const { input, setInput, secondary, setSecondary, secondaryDef, output, error } =
    useToolState(basicAuthLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <div className="flex h-full flex-col gap-3">
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">Username</span>
            <CodeEditor value={input} onChange={setInput} placeholder="aladdin" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">{secondaryDef?.label}</span>
            <CodeEditor value={secondary} onChange={setSecondary} placeholder={secondaryDef?.placeholder} />
          </div>
        </div>
      }
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
