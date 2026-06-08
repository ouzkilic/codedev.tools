import { useGenerator } from '@/hooks/useGenerator';
import { GeneratorLayout } from '@/components/tool/GeneratorLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CopyButton } from '@/components/tool/CopyButton';
import { GRADIENT_OPTIONS, gradientCss, buildGradient } from './logic';

export default function CssGradient() {
  const { options, setOption, optionDefs, output, error } = useGenerator(GRADIENT_OPTIONS, gradientCss);
  let preview: string;
  try {
    preview = buildGradient(options);
  } catch {
    preview = '';
  }

  return (
    <GeneratorLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      actions={<CopyButton text={output} />}
      output={
        <div className="flex h-full flex-col gap-3">
          <div className="min-h-40 flex-1 rounded-md border" style={{ background: preview }} />
          <pre className="rounded-md border bg-muted/30 p-3 font-mono text-sm">{output}</pre>
        </div>
      }
    />
  );
}
