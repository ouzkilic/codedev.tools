import { useState } from 'react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { FileInput } from '@/components/tool/FileInput';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { rgbaToAscii } from './logic';

function loadImage(buffer: ArrayBuffer, type: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([buffer as BlobPart], { type: type || 'image/png' }));
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image.')); };
    img.src = url;
  });
}

function drawToCanvas(img: HTMLImageElement, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return c;
}

export default function ImageAscii() {
  const [output, setOutput] = useState('');
  const [cols, setCols] = useState('80');
  const [error, setError] = useState<string | null>(null);

  const onFile = async (buffer: ArrayBuffer, file: File) => {
    try {
      const img = await loadImage(buffer, file.type);
      const w = Math.max(1, Math.min(400, parseInt(cols, 10) || 80));
      const ratio = img.naturalHeight / img.naturalWidth || 1;
      const h = Math.max(1, Math.round(w * ratio * 0.5));
      const canvas = drawToCanvas(img, w, h);
      const { data } = canvas.getContext('2d')!.getImageData(0, 0, w, h);
      setOutput(rgbaToAscii(data, w, h));
      setError(null);
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : 'Could not convert image.');
    }
  };

  return (
    <TwoPaneLayout
      error={error}
      toolbar={
        <ToolOptions
          defs={[{ key: 'cols', label: 'Columns', type: 'text', default: '80', placeholder: '80' }]}
          values={{ cols }}
          onChange={(_, value) => setCols(String(value))}
        />
      }
      left={
        <div className="flex h-full flex-col gap-3">
          <FileInput accept="image/*" onFile={(buffer, file) => void onFile(buffer, file)} minHeight={160} />
        </div>
      }
      right={<CodeEditor value={output} readOnly placeholder="ASCII art appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
