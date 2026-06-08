import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { useToolState } from '@/hooks/useToolState';
import { graphqlFormatLogic } from './logic';

export default function GraphqlFormat() {
  const { input, setInput, output, error } = useToolState(graphqlFormatLogic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="query { ... }" />}
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
