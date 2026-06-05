import { useMemo, useState } from 'react';
import type { ToolOption, ToolOptions } from './useToolState';

/**
 * State for "generator" tools (no input — produce output from options + a manual
 * regenerate trigger). Output is derived via useMemo keyed on options and a nonce,
 * so re-generation is explicit and lint-safe (no setState-in-effect).
 */
export function useGenerator(defs: ToolOption[], generate: (options: ToolOptions) => string) {
  const [options, setOptions] = useState<ToolOptions>(() => {
    const init: ToolOptions = {};
    for (const o of defs) init[o.key] = o.default;
    return init;
  });
  const [nonce, setNonce] = useState(0);

  const { output, error } = useMemo(() => {
    try {
      return { output: generate(options), error: null as string | null };
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : 'Generation failed' };
    }
    // nonce forces regeneration even when options are unchanged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, nonce, generate]);

  return {
    options,
    optionDefs: defs,
    setOption: (key: string, value: string | boolean) =>
      setOptions((prev) => ({ ...prev, [key]: value })),
    output,
    error,
    regenerate: () => setNonce((n) => n + 1),
  };
}
