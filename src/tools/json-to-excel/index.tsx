import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { jsonToXlsx } from './logic';

export default function JsonToExcel() {
  const [input, setInput] = useState('');
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState(0);
  const debounced = useDebouncedValue(input, 300);

  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) {
      Promise.resolve().then(() => {
        if (!cancelled) { setBytes(null); setError(null); setRows(0); }
      });
      return () => { cancelled = true; };
    }
    jsonToXlsx(debounced)
      .then((b) => {
        if (!cancelled) {
          setBytes(b);
          setError(null);
          try { setRows((JSON.parse(debounced) as unknown[]).length); } catch { setRows(0); }
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) { setBytes(null); setError(e instanceof Error ? e.message : 'Conversion failed'); }
      });
    return () => { cancelled = true; };
  }, [debounced]);

  const download = () => {
    if (!bytes) return;
    const blob = new Blob([bytes as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder='[ { "name": "Ada", "age": 36 } ]' />}
      right={
        <div className="flex h-full items-center justify-center rounded-md border text-sm text-muted-foreground" style={{ minHeight: 320 }}>
          {bytes ? `${rows} row(s) ready — click Download.` : 'Paste a JSON array of objects…'}
        </div>
      }
      actions={
        <Button variant="outline" size="sm" onClick={download} disabled={!bytes}>
          <Download className="mr-1 size-4" /> .xlsx
        </Button>
      }
    />
  );
}
