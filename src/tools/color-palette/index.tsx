import { useGenerator } from '@/hooks/useGenerator';
import { GeneratorLayout } from '@/components/tool/GeneratorLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { RegenerateButton } from '@/components/tool/RegenerateButton';
import { PALETTE_OPTIONS, buildPalette } from './logic';

export default function ColorPalette() {
  const { options, setOption, optionDefs, output, error, regenerate } = useGenerator(
    PALETTE_OPTIONS,
    buildPalette,
  );
  return (
    <GeneratorLayout
      error={error}
      toolbar={
        <>
          <ToolOptions defs={optionDefs} values={options} onChange={setOption} />
          <RegenerateButton onClick={regenerate} />
        </>
      }
      actions={<CopyButton text={output} />}
      output={<CodeEditor value={output} readOnly />}
    />
  );
}
