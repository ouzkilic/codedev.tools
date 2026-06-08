import { useGenerator } from '@/hooks/useGenerator';
import { GeneratorLayout } from '@/components/tool/GeneratorLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CopyButton } from '@/components/tool/CopyButton';
import { SHADOW_OPTIONS, boxShadowCss, buildShadow } from './logic';

export default function BoxShadow() {
  const { options, setOption, optionDefs, output, error } = useGenerator(SHADOW_OPTIONS, boxShadowCss);
  let shadow: string;
  try {
    shadow = buildShadow(options);
  } catch {
    shadow = 'none';
  }

  return (
    <GeneratorLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      actions={<CopyButton text={output} />}
      output={
        <div className="flex h-full flex-col gap-3">
          <div className="flex min-h-40 flex-1 items-center justify-center rounded-md border bg-muted/20">
            <div className="size-32 rounded-lg bg-background" style={{ boxShadow: shadow }} />
          </div>
          <pre className="rounded-md border bg-muted/30 p-3 font-mono text-sm">{output}</pre>
        </div>
      }
    />
  );
}
