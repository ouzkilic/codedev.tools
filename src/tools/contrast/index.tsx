import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { contrastLogic } from './logic';

export default function Contrast() {
  const { input, setInput, secondary, setSecondary, secondaryDef, output, error } =
    useToolState(contrastLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={
        <div className="flex h-full flex-col gap-3">
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">Foreground color</span>
            <CodeEditor value={input} onChange={setInput} placeholder="#1a1a1a" minHeight={140} />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">{secondaryDef?.label}</span>
            <CodeEditor value={secondary} onChange={setSecondary} placeholder={secondaryDef?.placeholder} minHeight={140} />
          </div>
        </div>
      }
      right={<CodeEditor value={output} readOnly placeholder="Contrast result…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
