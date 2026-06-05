import { useAsyncToolState } from '@/hooks/useAsyncToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { hmacLogic } from './logic';

export default function Hmac() {
  const { input, setInput, secondary, setSecondary, secondaryDef, output, error, options, setOption, optionDefs } =
    useAsyncToolState(hmacLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={
        <div className="flex h-full flex-col gap-3">
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">Message</span>
            <CodeEditor value={input} onChange={setInput} placeholder="Message to sign…" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="mb-1 text-xs text-muted-foreground">{secondaryDef?.label}</span>
            <CodeEditor value={secondary} onChange={setSecondary} placeholder={secondaryDef?.placeholder} />
          </div>
        </div>
      }
      right={<CodeEditor value={output} readOnly placeholder="Signature (hex)…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
