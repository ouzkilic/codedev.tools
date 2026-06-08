import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ToolOption, ToolOptions as Values } from '@/hooks/useToolState';
import { computeCanvasSize } from './logic';

const OPTION_DEFS: ToolOption[] = [
  {
    key: 'theme',
    label: 'Theme',
    type: 'select',
    default: 'dark',
    choices: [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
    ],
  },
  { key: 'fontSize', label: 'Font size', type: 'text', default: '14' },
];

export default function CodeImage() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Values>({ theme: 'dark', fontSize: '14' });
  const [dataUrl, setDataUrl] = useState('');
  const debounced = useDebouncedValue(input, 250);

  useEffect(() => {
    let cancelled = false;
    const render = (): string => {
      if (!debounced.trim()) return '';
      const fontSize = Math.min(Math.max(parseInt(String(options.fontSize), 10) || 14, 8), 48);
      const lineHeight = Math.round(fontSize * 1.5);
      const padding = 24;
      const charWidth = fontSize * 0.6;
      const lines = debounced.split('\n');
      const { width, height } = computeCanvasSize(lines, { lineHeight, padding, charWidth });

      const scale = 2; // retina
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.scale(scale, scale);

      const dark = options.theme !== 'light';
      ctx.fillStyle = dark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = 'top';
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b';
      lines.forEach((line, i) => ctx.fillText(line, padding, padding + i * lineHeight));
      return canvas.toDataURL('image/png');
    };
    // Defer to a microtask so the effect body has no synchronous setState.
    Promise.resolve().then(() => {
      if (!cancelled) setDataUrl(render());
    });
    return () => { cancelled = true; };
  }, [debounced, options.theme, options.fontSize]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'code.png';
    a.click();
  };

  return (
    <TwoPaneLayout
      toolbar={<ToolOptions defs={OPTION_DEFS} values={options} onChange={(k, v) => setOptions((o) => ({ ...o, [k]: v }))} />}
      left={<CodeEditor value={input} onChange={setInput} placeholder="const greeting = 'hello';" />}
      right={
        <div className="flex h-full items-center justify-center overflow-auto rounded-md border bg-muted/20 p-3" style={{ minHeight: 320 }}>
          {dataUrl ? (
            <img src={dataUrl} alt="code" className="max-w-full rounded shadow-sm" />
          ) : (
            <span className="text-sm text-muted-foreground">Image preview appears here…</span>
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
