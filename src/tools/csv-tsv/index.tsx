import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { csvTsvLogic } from './logic';

export default function CsvTsv() {
  const { input, setInput, output, error, options, setOption, optionDefs } =
    useToolState(csvTsvLogic);
  const tsvOut = options.mode === 'csv-to-tsv';
  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={optionDefs} values={options} onChange={setOption} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder={'a,b\n1,2'} />}
      right={<CodeEditor value={output} readOnly />}
      actions={
        <>
          <CopyButton text={output} />
          <DownloadButton text={output} filename={tsvOut ? 'data.tsv' : 'data.csv'} />
        </>
      }
    />
  );
}
