import { useGenerator } from '@/hooks/useGenerator';
import { GeneratorLayout } from '@/components/tool/GeneratorLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { RegenerateButton } from '@/components/tool/RegenerateButton';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { UUID_OPTIONS, generateUuids } from './logic';

export default function Uuid() {
  const { options, setOption, optionDefs, output, error, regenerate } =
    useGenerator(UUID_OPTIONS, generateUuids);
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
