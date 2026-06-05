import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RegenerateButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <RefreshCw className="mr-1 size-4" /> Regenerate
    </Button>
  );
}
