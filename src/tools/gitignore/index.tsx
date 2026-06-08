import { useGenerator } from '@/hooks/useGenerator';
import { GeneratorLayout } from '@/components/tool/GeneratorLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { GITIGNORE_OPTIONS, buildGitignore } from './logic';

export default function Gitignore() {
  const { options, setOption, optionDefs, output, error } = useGenerator(
    GITIGNORE_OPTIONS,
    buildGitignore,
  );
  return (
    <GeneratorLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      actions={<CopyButton text={output} />}
      output={<CodeEditor value={output} readOnly />}
    />
  );
}
