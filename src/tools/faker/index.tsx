import { useEffect, useState } from 'react';
import { GeneratorLayout } from '@/components/tool/GeneratorLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { RegenerateButton } from '@/components/tool/RegenerateButton';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import type { ToolOption, ToolOptions as Values } from '@/hooks/useToolState';
import { FAKE_TYPES, generateFake } from './logic';

const OPTION_DEFS: ToolOption[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    default: 'fullName',
    choices: FAKE_TYPES.map((t) => ({ value: t, label: t })),
  },
  { key: 'count', label: 'Count', type: 'text', default: '10', placeholder: '10' },
];

export default function Faker() {
  const [options, setOptions] = useState<Values>({ type: 'fullName', count: '10' });
  const [nonce, setNonce] = useState(0);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const count = Math.min(Math.max(parseInt(String(options.count), 10) || 1, 1), 1000);
    generateFake(String(options.type), count)
      .then((out) => {
        if (!cancelled) {
          setOutput(out);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setOutput('');
          setError(e instanceof Error ? e.message : 'Generation failed');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [options, nonce]);

  return (
    <GeneratorLayout
      error={error}
      toolbar={
        <>
          <ToolOptions defs={OPTION_DEFS} values={options} onChange={(k, v) => setOptions((o) => ({ ...o, [k]: v }))} />
          <RegenerateButton onClick={() => setNonce((n) => n + 1)} />
        </>
      }
      actions={<CopyButton text={output} />}
      output={<CodeEditor value={output} readOnly />}
    />
  );
}
