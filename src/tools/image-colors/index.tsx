import { useState } from 'react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { extractPalette } from './logic';

function loadImage(buffer: ArrayBuffer, type: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([buffer as BlobPart], { type: type || 'image/png' }));
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image.')); };
    img.src = url;
  });
}

function drawToCanvas(img: HTMLImageElement, w = img.naturalWidth, h = img.naturalHeight): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return c;
}

export default function ImageColors() {
  const [output, setOutput] = useState('');
  const [palette, setPalette] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState('6');

  const onFile = (buffer: ArrayBuffer, file: File) => {
    const n = Math.max(1, Math.floor(Number(count)) || 6);
    void (async () => {
      try {
        const img = await loadImage(buffer, file.type);
        const scale = Math.min(1, 100 / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = drawToCanvas(img, w, h);
        const { data } = canvas.getContext('2d')!.getImageData(0, 0, w, h);
        const colors = extractPalette(data, n);
        setPalette(colors);
        setOutput(colors.join('\n'));
        setPreview(canvas.toDataURL());
        setError(null);
      } catch (e) {
        setOutput('');
        setPalette([]);
        setError(e instanceof Error ? e.message : 'Could not process image');
      }
    })();
  };

  return (
    <TwoPaneLayout
      error={error}
      toolbar={
        <ToolOptions
          defs={[{ key: 'count', label: 'Colors', type: 'text', default: '6', placeholder: '6' }]}
          values={{ count }}
          onChange={(_, value) => setCount(String(value))}
        />
      }
      left={
        <div className="flex h-full flex-col gap-3">
          <FileInput accept="image/*" onFile={onFile} minHeight={160} />
          {preview && (
            <img src={preview} alt="preview" className="max-h-40 self-center rounded border object-contain" />
          )}
        </div>
      }
      right={
        <div className="flex h-full flex-col gap-3">
          {palette.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {palette.map((hex) => (
                <div key={hex} className="flex items-center gap-2 rounded border px-2 py-1 text-xs font-mono">
                  <span className="inline-block size-4 rounded" style={{ background: hex }} />
                  {hex}
                </div>
              ))}
            </div>
          )}
          <CodeEditor value={output} readOnly placeholder="Color palette appears here…" />
        </div>
      }
      actions={<CopyButton text={output} />}
    />
  );
}
