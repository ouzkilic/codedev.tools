import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { parseDataUri } from './logic';

const EXT: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp',
  'image/svg+xml': 'svg', 'application/pdf': 'pdf', 'application/json': 'json',
  'text/plain': 'txt', 'text/html': 'html', 'text/csv': 'csv',
};

export default function Base64ToFile() {
  const [input, setInput] = useState('');
  const debounced = useDebouncedValue(input, 250);

  const { file, error } = useMemo(() => {
    if (!debounced.trim()) return { file: null, error: null as string | null };
    try {
      return { file: parseDataUri(debounced), error: null };
    } catch (e) {
      return { file: null, error: e instanceof Error ? e.message : 'Invalid input' };
    }
  }, [debounced]);

  const isImage = file?.mime.startsWith('image/');
  const dataUri = file ? debounced.trim().startsWith('data:') ? debounced.trim() : `data:${file.mime};base64,${debounced.trim()}` : '';

  const download = () => {
    if (!file) return;
    const blob = new Blob([file.bytes as BlobPart], { type: file.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `file.${EXT[file.mime] ?? 'bin'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="data:image/png;base64,iVBORw0KGgo..." />}
      right={
        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-md border p-4 text-sm text-muted-foreground" style={{ minHeight: 320 }}>
          {file ? (
            <>
              <div>{file.mime} · {file.bytes.length} bytes</div>
              {isImage && <img src={dataUri} alt="preview" className="max-h-48 rounded border object-contain" />}
            </>
          ) : (
            'Paste a Base64 string or data URI…'
          )}
        </div>
      }
      actions={
        <Button variant="outline" size="sm" onClick={download} disabled={!file}>
          <Download className="mr-1 size-4" /> Download
        </Button>
      }
    />
  );
}
