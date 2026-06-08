import { useEffect, useState } from 'react';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { FileInput } from '@/components/tool/FileInput';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import type { ToolOption, ToolOptions as Values } from '@/hooks/useToolState';
import { hashBuffer } from './logic';

const OPTION_DEFS: ToolOption[] = [
  {
    key: 'algo',
    label: 'Algorithm',
    type: 'select',
    default: 'SHA-256',
    choices: ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map((a) => ({ value: a, label: a })),
  },
];

export default function FileHash() {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [name, setName] = useState('');
  const [options, setOptions] = useState<Values>({ algo: 'SHA-256' });
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buffer) return;
    let cancelled = false;
    hashBuffer(buffer, String(options.algo))
      .then((h) => { if (!cancelled) { setOutput(h); setError(null); } })
      .catch((e: unknown) => { if (!cancelled) { setOutput(''); setError(e instanceof Error ? e.message : 'Hashing failed'); } });
    return () => { cancelled = true; };
  }, [buffer, options.algo]);

  return (
    <TwoPaneLayout
      error={error}
      toolbar={<ToolOptions defs={OPTION_DEFS} values={options} onChange={(k, v) => setOptions((o) => ({ ...o, [k]: v }))} />}
      left={
        <FileInput
          onFile={(buf, file) => { setBuffer(buf); setName(file.name); }}
        />
      }
      right={<CodeEditor value={output ? `${name}\n${output}` : ''} readOnly placeholder="File hash appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
