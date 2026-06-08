import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { Button } from '@/components/ui/button';
import { diffStats } from './logic';

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

interface Buf {
  buffer: ArrayBuffer;
  type: string;
}

export default function ImageDiff() {
  const [bufA, setBufA] = useState<Buf | null>(null);
  const [bufB, setBufB] = useState<Buf | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [stats, setStats] = useState<{ changed: number; total: number; percent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bufA || !bufB) return;
    let cancelled = false;

    const run = async () => {
      try {
        const [imgA, imgB] = await Promise.all([
          loadImage(bufA.buffer, bufA.type),
          loadImage(bufB.buffer, bufB.type),
        ]);
        const w = Math.max(imgA.naturalWidth, imgB.naturalWidth);
        const h = Math.max(imgA.naturalHeight, imgB.naturalHeight);

        const canvasA = drawToCanvas(imgA, w, h);
        const canvasB = drawToCanvas(imgB, w, h);
        const ctxA = canvasA.getContext('2d')!;
        const ctxB = canvasB.getContext('2d')!;
        const dataA = ctxA.getImageData(0, 0, w, h).data;
        const dataB = ctxB.getImageData(0, 0, w, h).data;

        const s = diffStats(dataA, dataB, 0);

        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = w;
        diffCanvas.height = h;
        const diffCtx = diffCanvas.getContext('2d')!;
        const out = diffCtx.createImageData(w, h);
        const px = out.data;
        for (let i = 0; i < px.length; i += 4) {
          const dr = Math.abs(dataA[i] - dataB[i]);
          const dg = Math.abs(dataA[i + 1] - dataB[i + 1]);
          const db = Math.abs(dataA[i + 2] - dataB[i + 2]);
          const alphaDiff = dataA[i + 3] !== dataB[i + 3];
          if (dr > 0 || dg > 0 || db > 0 || alphaDiff) {
            px[i] = 255;
            px[i + 1] = 0;
            px[i + 2] = 0;
            px[i + 3] = 255;
          } else {
            px[i] = dataA[i];
            px[i + 1] = dataA[i + 1];
            px[i + 2] = dataA[i + 2];
            px[i + 3] = 60;
          }
        }
        diffCtx.putImageData(out, 0, 0);
        const url = diffCanvas.toDataURL('image/png');

        if (!cancelled) {
          setResult(url);
          setStats(s);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setResult(null);
          setStats(null);
          setError(e instanceof Error ? e.message : 'Could not compare images.');
        }
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [bufA, bufB]);

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = 'diff.png';
    a.click();
  };

  return (
    <TwoPaneLayout
      error={error}
      left={
        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Image A</span>
            <FileInput
              accept="image/*"
              onFile={(buffer, file) => setBufA({ buffer, type: file.type })}
              minHeight={120}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Image B</span>
            <FileInput
              accept="image/*"
              onFile={(buffer, file) => setBufB({ buffer, type: file.type })}
              minHeight={120}
            />
          </div>
        </div>
      }
      right={
        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-md border p-3">
          {result ? (
            <>
              <img src={result} alt="diff" className="max-h-72 rounded border object-contain" />
              {stats && (
                <span className="text-xs text-muted-foreground">
                  {stats.changed} / {stats.total} pixels changed ({stats.percent}%)
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Upload both images to compare…</span>
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
