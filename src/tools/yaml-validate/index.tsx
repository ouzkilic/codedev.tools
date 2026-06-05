import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { yamlValidateLogic } from './logic';

export default function YamlValidate() {
  const { input, setInput, output, error } = useToolState(yamlValidateLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder={'name: codedev\nversion: 1'} />}
      right={<CodeEditor value={output} readOnly placeholder="Validation result…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
