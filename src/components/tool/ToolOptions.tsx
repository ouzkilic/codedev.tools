import type { ToolOption, ToolOptions as Values } from '@/hooks/useToolState';
import { Input } from '@/components/ui/input';

interface Props {
  defs: ToolOption[];
  values: Values;
  onChange: (key: string, value: string | boolean) => void;
}

// Renders option controls (select / toggle / text) from a tool's option defs.
export function ToolOptions({ defs, values, onChange }: Props) {
  if (defs.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {defs.map((d) => (
        <label key={d.key} className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{d.label}</span>
          {d.type === 'select' && (
            <select
              value={String(values[d.key])}
              onChange={(e) => onChange(d.key, e.target.value)}
              className="h-8 rounded-md border bg-transparent px-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            >
              {d.choices?.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          )}
          {d.type === 'toggle' && (
            <input
              type="checkbox"
              checked={Boolean(values[d.key])}
              onChange={(e) => onChange(d.key, e.target.checked)}
              className="size-4"
            />
          )}
          {d.type === 'text' && (
            <Input
              value={String(values[d.key])}
              placeholder={d.placeholder}
              onChange={(e) => onChange(d.key, e.target.value)}
              className="h-8 w-64 font-mono"
            />
          )}
        </label>
      ))}
    </div>
  );
}
