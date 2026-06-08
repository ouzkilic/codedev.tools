import { useAsyncToolState } from '@/hooks/useAsyncToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { bcryptLogic } from './logic';

export default function Bcrypt() {
  const { input, setInput, secondary, setSecondary, secondaryDef, output, error, options, setOption, optionDefs } =
    useAsyncToolState(bcryptLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={
        <div className="flex h-full flex-col gap-3">
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">Password</span>
            <CodeEditor value={input} onChange={setInput} placeholder="Password to hash or verify…" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">{secondaryDef?.label}</span>
            <CodeEditor value={secondary} onChange={setSecondary} placeholder={secondaryDef?.placeholder} />
          </div>
        </div>
      }
      right={<CodeEditor value={output} readOnly placeholder="Hash or verification result…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
