import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { curlToCodeLogic } from './logic';

export default function CurlToCode() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(curlToCodeLogic);
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={
        <CodeEditor
          value={input}
          onChange={setInput}
          placeholder={'curl -X POST https://api.example.com/x -H "Content-Type: application/json" -d \'{"name":"codedev"}\''}
        />
      }
      right={<CodeEditor value={output} readOnly />}
      actions={<CopyButton text={output} />}
    />
  );
}
