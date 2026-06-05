import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { jsonValidateLogic } from './logic';

export default function JsonValidate() {
  const { input, setInput, secondary, setSecondary, secondaryDef, output, error } =
    useToolState(jsonValidateLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <div className="flex h-full flex-col gap-3">
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">JSON data</span>
            <CodeEditor value={input} onChange={setInput} placeholder='{ "id": 1 }' />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">{secondaryDef?.label}</span>
            <CodeEditor value={secondary} onChange={setSecondary} placeholder={secondaryDef?.placeholder} />
          </div>
        </div>
      }
      right={<CodeEditor value={output} readOnly placeholder="Validation result…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
