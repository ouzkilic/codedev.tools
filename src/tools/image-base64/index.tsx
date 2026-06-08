import { useState } from 'react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { bufferToDataUri } from './logic';

export default function ImageBase64() {
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onFile = (buffer: ArrayBuffer, file: File) => {
    try {
      setOutput(bufferToDataUri(buffer, file.type));
      setError(null);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Could not read file');
    }
  };

  const isImage = output.startsWith('data:image/');

  return (
    <TwoPaneLayout
      error={error}
      left={
        <div className="flex h-full flex-col gap-3">
          <FileInput accept="image/*" onFile={onFile} minHeight={160} />
          {isImage && (
            <img src={output} alt="preview" className="max-h-40 self-center rounded border object-contain" />
          )}
        </div>
      }
      right={<CodeEditor value={output} readOnly placeholder="Data URI appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
