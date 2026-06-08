import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { jsonPatchLogic } from './logic';

export default function JsonPatch() {
  const { input, setInput, output, secondary, setSecondary, secondaryDef } =
    useToolState(jsonPatchLogic);

  return (
    <TwoPaneLayout
      left={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="mb-1 text-xs text-muted-foreground">JSON Document</span>
            <CodeEditor value={input} onChange={setInput} />
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-xs text-muted-foreground">{secondaryDef?.label}</span>
            <CodeEditor
              value={secondary}
              onChange={setSecondary}
              placeholder={secondaryDef?.placeholder}
            />
          </div>
        </div>
      }
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
