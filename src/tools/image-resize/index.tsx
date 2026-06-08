import { useState } from 'react';
import { Download } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { computeSize } from './logic';

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

export default function ImageResize() {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [keepAspect, setKeepAspect] = useState(true);
  const [src, setSrc] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const process = async (buffer: ArrayBuffer, type: string) => {
    try {
      const img = await loadImage(buffer, type);
      const size = computeSize(
        img.naturalWidth,
        img.naturalHeight,
        Number(width) || 0,
        Number(height) || 0,
        keepAspect,
      );
      const canvas = drawToCanvas(img, size.width, size.height);
      const url = canvas.toDataURL('image/png');
      setResult(url);
      setDims(size);
      setError(null);
    } catch (e) {
      setResult(null);
      setDims(null);
      setError(e instanceof Error ? e.message : 'Could not resize image.');
    }
  };

  const [lastBuffer, setLastBuffer] = useState<{ buffer: ArrayBuffer; type: string } | null>(null);

  const onFile = (buffer: ArrayBuffer, file: File) => {
    setSrc(URL.createObjectURL(new Blob([buffer as BlobPart], { type: file.type || 'image/png' })));
    setLastBuffer({ buffer, type: file.type });
    void process(buffer, file.type);
  };

  const reprocess = () => {
    if (lastBuffer) void process(lastBuffer.buffer, lastBuffer.type);
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = 'resized.png';
    a.click();
  };

  return (
    <TwoPaneLayout
      error={error}
      toolbar={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">Width</span>
            <Input
              value={width}
              placeholder="auto"
              inputMode="numeric"
              onChange={(e) => setWidth(e.target.value)}
              onBlur={reprocess}
              className="h-8 w-24 font-mono"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">Height</span>
            <Input
              value={height}
              placeholder="auto"
              inputMode="numeric"
              onChange={(e) => setHeight(e.target.value)}
              onBlur={reprocess}
              className="h-8 w-24 font-mono"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(e) => { setKeepAspect(e.target.checked); reprocess(); }}
              className="size-4"
            />
            <span className="text-muted-foreground">Keep aspect ratio</span>
          </label>
        </div>
      }
      left={
        <div className="flex h-full flex-col gap-3">
          <FileInput accept="image/*" onFile={onFile} minHeight={160} />
          {src && (
            <img src={src} alt="source" className="max-h-40 self-center rounded border object-contain" />
          )}
        </div>
      }
      right={
        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border p-3">
          {result ? (
            <>
              <img src={result} alt="resized" className="max-h-72 rounded border object-contain" />
              {dims && (
                <span className="text-xs text-muted-foreground">{dims.width} × {dims.height}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Resized image appears here…</span>
          )}
        </div>
      }
      actions={
        <Button onClick={download} disabled={!result} size="sm">
          <Download className="size-4" />
          Download
        </Button>
      }
    />
  );
}
