import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ToolOption, ToolOptions as Values } from '@/hooks/useToolState';
import { generateQrDataUrl } from './logic';

const OPTION_DEFS: ToolOption[] = [
  {
    key: 'ecc',
    label: 'Error correction',
    type: 'select',
    default: 'M',
    choices: [
      { value: 'L', label: 'Low' },
      { value: 'M', label: 'Medium' },
      { value: 'Q', label: 'Quartile' },
      { value: 'H', label: 'High' },
    ],
  },
];

export default function Qr() {
  const [text, setText] = useState('');
  const [options, setOptions] = useState<Values>({ ecc: 'M' });
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebouncedValue(text, 250);

  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setDataUrl('');
          setError(null);
        }
      });
      return () => {
        cancelled = true;
      };
    }
    generateQrDataUrl(debounced, String(options.ecc))
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setDataUrl('');
          setError(e instanceof Error ? e.message : 'Could not generate QR code');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, options.ecc]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={OPTION_DEFS} values={options} onChange={(k, v) => setOptions((o) => ({ ...o, [k]: v }))} />}
      left={<CodeEditor value={text} onChange={setText} placeholder="https://codedev.tools" />}
      right={
        <div className="flex h-full items-center justify-center rounded-md border" style={{ minHeight: 320 }}>
          {dataUrl ? (
            <img src={dataUrl} alt="QR code" width={256} height={256} className="rounded bg-white p-2" />
          ) : (
            <span className="text-sm text-muted-foreground">QR code appears here…</span>
          )}
        </div>
      }
      actions={
        <Button variant="outline" size="sm" onClick={download} disabled={!dataUrl}>
          <Download className="mr-1 size-4" /> PNG
        </Button>
      }
    />
  );
}
