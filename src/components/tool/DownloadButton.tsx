import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function DownloadButton({ text, filename }: { text: string; filename: string }) {
  const download = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button variant="outline" size="sm" onClick={download} disabled={!text}>
      <Download className="mr-1 size-4" /> Download
    </Button>
  );
}
