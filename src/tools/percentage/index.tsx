import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { percentageLogic } from './logic';

export default function Percentage() {
  const {
    input,
    setInput,
    output,
    error,
    options,
    setOption,
    optionDefs,
    secondary,
    setSecondary,
    secondaryDef,
  } = useToolState(percentageLogic);

  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={
        <div className="flex flex-col gap-3">
          <span className="mb-1 text-xs text-muted-foreground">Value A</span>
          <CodeEditor value={input} onChange={setInput} placeholder="Enter number A" />
          <span className="mb-1 text-xs text-muted-foreground">{secondaryDef?.label}</span>
          <CodeEditor value={secondary} onChange={setSecondary} placeholder={secondaryDef?.placeholder} />
        </div>
      }
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
