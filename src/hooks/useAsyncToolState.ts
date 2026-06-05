import { useEffect, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';
import type { ToolContext, ToolOption, ToolOptions } from './useToolState';

export interface AsyncToolLogic {
  /** Async transform (e.g. Web Crypto). Rejections surface as the error banner. */
  transform: (input: string, ctx: ToolContext) => Promise<string>;
  options?: ToolOption[];
  secondary?: { label: string; placeholder?: string };
}

export function useAsyncToolState(logic: AsyncToolLogic) {
  const [input, setInput] = useState('');
  const [secondary, setSecondary] = useState('');
  const [options, setOptions] = useState<ToolOptions>(() => {
    const init: ToolOptions = {};
    for (const o of logic.options ?? []) init[o.key] = o.default;
    return init;
  });
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebouncedValue(input, 250);
  const debouncedSecondary = useDebouncedValue(secondary, 250);

  useEffect(() => {
    let cancelled = false;
    // All state updates happen in the async callbacks, never synchronously here.
    const run = async () => {
      if (!debounced.trim()) return '';
      return logic.transform(debounced, { options, secondary: debouncedSecondary });
    };
    run()
      .then((out) => {
        if (!cancelled) {
          setOutput(out);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setOutput('');
          setError(e instanceof Error ? e.message : 'Something went wrong');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, debouncedSecondary, options, logic]);

  return {
    input, setInput,
    secondary, setSecondary,
    options,
    setOption: (key: string, value: string | boolean) =>
      setOptions((prev) => ({ ...prev, [key]: value })),
    optionDefs: logic.options ?? [],
    secondaryDef: logic.secondary,
    output, error,
  };
}
