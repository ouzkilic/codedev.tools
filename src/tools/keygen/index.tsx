import { useEffect, useState } from 'react';
import { GeneratorLayout } from '@/components/tool/GeneratorLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { RegenerateButton } from '@/components/tool/RegenerateButton';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import type { ToolOption, ToolOptions as Values } from '@/hooks/useToolState';
import { generateKeyPair, type KeyPair } from './logic';

const OPTION_DEFS: ToolOption[] = [
  {
    key: 'algorithm',
    label: 'Algorithm',
    type: 'select',
    default: 'EC-P256',
    choices: [
      { value: 'EC-P256', label: 'EC P-256' },
      { value: 'EC-P384', label: 'EC P-384' },
      { value: 'RSA-2048', label: 'RSA 2048' },
      { value: 'RSA-4096', label: 'RSA 4096' },
    ],
  },
];

export default function Keygen() {
  const [options, setOptions] = useState<Values>({ algorithm: 'EC-P256' });
  const [nonce, setNonce] = useState(0);
  const [pair, setPair] = useState<KeyPair | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateKeyPair(String(options.algorithm))
      .then((kp) => { if (!cancelled) { setPair(kp); setError(null); } })
      .catch((e: unknown) => { if (!cancelled) { setError(e instanceof Error ? e.message : 'Key generation failed'); } });
    return () => { cancelled = true; };
  }, [options, nonce]);

  const pending = !pair && !error ? 'Generating…' : '';

  return (
    <GeneratorLayout
      error={error}
      toolbar={
        <>
          <ToolOptions defs={OPTION_DEFS} values={options} onChange={(k, v) => setOptions((o) => ({ ...o, [k]: v }))} />
          <RegenerateButton onClick={() => setNonce((n) => n + 1)} />
        </>
      }
      actions={pair ? <CopyButton text={`${pair.publicKey}\n\n${pair.privateKey}`} /> : null}
      output={
        <div className="grid h-full grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col">
            <span className="mb-1 text-xs text-muted-foreground">Public key</span>
            <CodeEditor value={pending || (pair?.publicKey ?? '')} readOnly />
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-xs text-muted-foreground">Private key</span>
            <CodeEditor value={pending || (pair?.privateKey ?? '')} readOnly />
          </div>
        </div>
      }
    />
  );
}
