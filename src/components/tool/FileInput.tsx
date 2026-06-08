import { useState } from 'react';
import { Upload } from 'lucide-react';

interface Props {
  onFile: (buffer: ArrayBuffer, file: File) => void;
  accept?: string;
  minHeight?: number;
}

// Drag-and-drop / click file picker. Reads the file as an ArrayBuffer (local only).
export function FileInput({ onFile, accept, minHeight = 320 }: Props) {
  const [name, setName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handle = async (file: File) => {
    setName(file.name);
    onFile(await file.arrayBuffer(), file);
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) void handle(f);
      }}
      className={`flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center text-sm transition-colors ${
        dragging ? 'border-ring bg-muted/50' : 'text-muted-foreground hover:bg-muted/30'
      }`}
      style={{ minHeight }}
    >
      <Upload className="size-6" />
      <span>{name ?? 'Drop a file here, or click to choose'}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handle(f);
        }}
      />
    </label>
  );
}
