import { useState } from 'react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { DownloadButton } from '@/components/tool/DownloadButton';
import { excelToCsv } from './logic';

export default function ExcelToCsv() {
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onFile = (buffer: ArrayBuffer) => {
    excelToCsv(buffer)
      .then((csv) => { setOutput(csv); setError(null); })
      .catch((e: unknown) => { setOutput(''); setError(e instanceof Error ? e.message : 'Could not read file'); });
  };

  return (
    <TwoPaneLayout
      error={error}
      left={<FileInput accept=".xlsx,.xls,.ods" onFile={onFile} />}
      right={<CodeEditor value={output} readOnly placeholder="CSV appears here…" />}
      actions={
        <>
          <CopyButton text={output} />
          <DownloadButton text={output} filename="sheet.csv" />
        </>
      }
    />
  );
}
