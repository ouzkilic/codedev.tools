import { useState } from 'react';
import jsQR from 'jsqr';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { formatQrResult } from './logic';

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

export default function QrDecode() {
  const [output, setOutput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = (buffer: ArrayBuffer, file: File) => {
    void (async () => {
      try {
        const img = await loadImage(buffer, file.type);
        const canvas = drawToCanvas(img);
        const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        setOutput(formatQrResult(code ? code.data : null));
        setPreview(canvas.toDataURL());
        setError(null);
      } catch (e) {
        setOutput('');
        setError(e instanceof Error ? e.message : 'Could not process image');
      }
    })();
  };

  return (
    <TwoPaneLayout
      error={error}
      left={
        <div className="flex h-full flex-col gap-3">
          <FileInput accept="image/*" onFile={onFile} minHeight={160} />
          {preview && (
            <img src={preview} alt="preview" className="max-h-40 self-center rounded border object-contain" />
          )}
        </div>
      }
      right={<CodeEditor value={output} readOnly placeholder="Decoded QR text appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
