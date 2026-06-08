import { useState } from 'react';
import { Download } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { extFor, mimeFor } from './logic';

function loadImage(buffer: ArrayBuffer, type: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([buffer as BlobPart], { type: type || 'image/png' }));
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image.'));
    };
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

export default function ImageConvert() {
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState('0.92');
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onFile = async (buffer: ArrayBuffer, file: File) => {
    try {
      setError(null);
      const img = await loadImage(buffer, file.type);
      const canvas = drawToCanvas(img);
      const mime = mimeFor(format);
      const q = parseFloat(quality);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setResultUrl('');
            setError('Could not convert image.');
            return;
          }
          setResultUrl(URL.createObjectURL(blob));
        },
        mime,
        Number.isFinite(q) ? q : undefined,
      );
    } catch (e) {
      setResultUrl('');
      setError(e instanceof Error ? e.message : 'Could not convert image.');
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'image.' + extFor(format);
    a.click();
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Format</span>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="h-8 rounded-md border bg-transparent px-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Quality</span>
        <Input
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="h-8 w-20 font-mono"
        />
      </label>
    </div>
  );

  return (
    <TwoPaneLayout
      error={error}
      toolbar={toolbar}
      left={
        <div className="flex h-full flex-col gap-3">
          <FileInput accept="image/*" onFile={(b, f) => void onFile(b, f)} minHeight={160} />
        </div>
      }
      right={
        resultUrl ? (
          <img src={resultUrl} alt="result" className="max-h-full self-center rounded border object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Converted image appears here…
          </div>
        )
      }
      actions={
        <Button onClick={download} disabled={!resultUrl} size="sm">
          <Download className="size-4" />
          Download
        </Button>
      }
    />
  );
}
