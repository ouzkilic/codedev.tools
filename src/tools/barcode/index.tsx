import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ToolOption, ToolOptions as Values } from '@/hooks/useToolState';
import { BARCODE_FORMATS } from './logic';

const OPTION_DEFS: ToolOption[] = [
  {
    key: 'format',
    label: 'Format',
    type: 'select',
    default: 'CODE128',
    choices: BARCODE_FORMATS.map((f) => ({ value: f, label: f })),
  },
];

export default function BarcodeTool() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Values>({ format: 'CODE128' });
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounced = useDebouncedValue(input, 250);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (!debounced.trim()) {
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        setError(null);
        setReady(false);
        return;
      }
      try {
        JsBarcode(canvas, debounced, { format: String(options.format), displayValue: true, margin: 12 });
        setError(null);
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid input for this barcode format.');
        setReady(false);
      }
    });
    return () => { cancelled = true; };
  }, [debounced, options.format]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'barcode.png';
    a.click();
  };

  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={OPTION_DEFS} values={options} onChange={(k, v) => setOptions((o) => ({ ...o, [k]: v }))} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="123456789012" />}
      right={
        <div className="flex h-full items-center justify-center rounded-md border bg-white" style={{ minHeight: 320 }}>
          <canvas ref={canvasRef} className={ready ? '' : 'hidden'} />
          {!ready && <span className="text-sm text-muted-foreground">Barcode appears here…</span>}
        </div>
      }
      actions={
        <Button variant="outline" size="sm" onClick={download} disabled={!ready}>
          <Download className="mr-1 size-4" /> PNG
        </Button>
      }
    />
  );
}
