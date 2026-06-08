import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { Button } from '@/components/ui/button';
import { FAVICON_SIZES, linkTags } from './logic';

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

function drawSize(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  c.getContext('2d')!.drawImage(img, 0, 0, size, size);
  return c;
}

function FaviconPreview({ img, size }: { img: HTMLImageElement; size: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    canvas.getContext('2d')!.drawImage(img, 0, 0, size, size);
  }, [img, size]);

  const download = () => {
    drawSize(img, size).toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `favicon-${size}x${size}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="flex flex-col items-center gap-2 rounded border p-3">
      <canvas
        ref={ref}
        className="rounded border bg-[repeating-conic-gradient(#0001_0_25%,transparent_0_50%)] bg-[length:12px_12px]"
        style={{ width: Math.min(size, 64), height: Math.min(size, 64) }}
      />
      <span className="text-xs text-muted-foreground">
        {size}×{size}
      </span>
      <Button size="sm" variant="outline" onClick={download}>
        <Download />
        Download
      </Button>
    </div>
  );
}

export default function Favicon() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = (buffer: ArrayBuffer, file: File) => {
    loadImage(buffer, file.type)
      .then((loaded) => {
        setImg(loaded);
        setError(null);
      })
      .catch((e: unknown) => {
        setImg(null);
        setError(e instanceof Error ? e.message : 'Could not load image.');
      });
  };

  const tags = linkTags();

  return (
    <TwoPaneLayout
      error={error}
      left={
        <div className="flex h-full flex-col gap-3">
          <FileInput accept="image/*" onFile={onFile} minHeight={160} />
          {img && (
            <div className="flex flex-wrap justify-center gap-3">
              {FAVICON_SIZES.map((size) => (
                <FaviconPreview key={size} img={img} size={size} />
              ))}
            </div>
          )}
        </div>
      }
      right={<CodeEditor value={tags} readOnly placeholder="HTML link tags appear here…" />}
      actions={<CopyButton text={tags} />}
    />
  );
}
