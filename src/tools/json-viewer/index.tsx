import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { isContainer, entriesOf, summarize, formatLeaf, type JsonValue } from './logic';

function TreeNode({ name, value, depth }: { name: string; value: JsonValue; depth: number }) {
  const [open, setOpen] = useState(depth < 1);

  if (!isContainer(value)) {
    return (
      <div className="font-mono text-sm leading-6" style={{ paddingLeft: depth * 16 }}>
        <span className="text-muted-foreground">{name}:</span>{' '}
        <span>{formatLeaf(value)}</span>
      </div>
    );
  }

  const entries = entriesOf(value);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 font-mono text-sm leading-6 hover:text-foreground/80"
        style={{ paddingLeft: depth * 16 }}
      >
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        <span className="text-muted-foreground">{name}</span>
        <span className="opacity-60">{summarize(value)}</span>
      </button>
      {open &&
        entries.map(([key, child]) => (
          <TreeNode key={key} name={key} value={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export default function JsonViewer() {
  const [input, setInput] = useState('');
  const debounced = useDebouncedValue(input, 250);

  const { data, error } = useMemo(() => {
    if (!debounced.trim()) return { data: undefined as JsonValue | undefined, error: null as string | null };
    try {
      return { data: JSON.parse(debounced) as JsonValue, error: null };
    } catch (e) {
      return { data: undefined, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }, [debounced]);

  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder='{ "a": { "b": [1, 2] } }' />}
      right={
        <div className="h-full overflow-auto rounded-md border p-3" style={{ minHeight: 320 }}>
          {data === undefined ? (
            <span className="text-sm text-muted-foreground">Parsed tree appears here…</span>
          ) : (
            <TreeNode name="root" value={data} depth={0} />
          )}
        </div>
      }
    />
  );
}
