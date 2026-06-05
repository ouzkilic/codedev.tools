import { useMemo } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

// Minimal theme so the editor blends into the surrounding panel (monochrome look).
const blendTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent', fontSize: '13px' },
  '&.cm-editor.cm-focused': { outline: 'none' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'transparent' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
});

export function CodeEditor({ value, onChange, readOnly, placeholder }: Props) {
  const { theme } = useTheme();
  const extensions = useMemo(() => [json(), blendTheme, EditorView.lineWrapping], []);

  return (
    <div
      className="h-full overflow-hidden rounded-md border bg-transparent focus-within:ring-2 focus-within:ring-ring/40"
      style={{ minHeight: 320 }}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        editable={!readOnly}
        placeholder={placeholder}
        theme={theme}
        height="100%"
        minHeight="320px"
        style={{ height: '100%' }}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          autocompletion: false,
        }}
      />
    </div>
  );
}
