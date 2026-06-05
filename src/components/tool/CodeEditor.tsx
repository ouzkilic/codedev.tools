interface Props {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

// Simple textarea to avoid extra dependencies. Can be upgraded to CodeMirror later.
export function CodeEditor({ value, onChange, readOnly, placeholder }: Props) {
  return (
    <textarea
      className="h-full w-full resize-none rounded-md border bg-transparent p-3
                 font-mono text-sm outline-none focus:ring-2 focus:ring-ring/40"
      style={{ minHeight: 320 }}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      spellCheck={false}
    />
  );
}
