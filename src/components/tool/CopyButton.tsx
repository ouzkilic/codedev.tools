import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 1200);
  };
  return (
    <Button variant="outline" size="sm" onClick={copy} disabled={!text}>
      {done ? <Check className="mr-1 size-4" /> : <Copy className="mr-1 size-4" />}
      {done ? 'Copied' : 'Copy'}
    </Button>
  );
}
