import { useState } from 'react';
import exifr from 'exifr';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { formatExif } from './logic';

export default function Exif() {
  const [output, setOutput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (buffer: ArrayBuffer, file: File) => {
    try {
      setError(null);
      const url = URL.createObjectURL(new Blob([buffer as BlobPart], { type: file.type || 'image/png' }));
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      const data = await exifr.parse(buffer).catch(() => null);
      setOutput(formatExif(data as Record<string, unknown> | null));
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Could not read file');
    }
  };

  return (
    <TwoPaneLayout
      error={error}
      left={
        <div className="flex h-full flex-col gap-3">
          <FileInput accept="image/*" onFile={onFile} minHeight={160} />
          {preview && (
            <img src={preview} alt="preview" className="max-h-40 self-center rounded border object-contain" />
          )}
        </div>
      }
      right={<CodeEditor value={output} readOnly placeholder="EXIF metadata appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
