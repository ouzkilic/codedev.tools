import { useState } from 'react';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { describeColor } from './logic';

export default function ColorPicker() {
  const [hex, setHex] = useState('#3b82f6');
  const output = describeColor(hex);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-4">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="h-16 w-24 cursor-pointer rounded-md border bg-transparent"
          aria-label="Pick a color"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="h-9 w-32 rounded-md border bg-transparent px-2 font-mono text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <div className="size-16 rounded-md border" style={{ background: hex }} />
      </div>
      <div className="flex items-center justify-end">
        <CopyButton text={output} />
      </div>
      <div className="min-h-0 flex-1">
        <CodeEditor value={output} readOnly />
      </div>
    </div>
  );
}
