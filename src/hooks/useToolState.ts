import { useMemo, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

export type ToolOptionType = 'select' | 'toggle' | 'text';

export interface ToolOption {
  key: string;
  label: string;
  type: ToolOptionType;
  /** for type 'select' */
  choices?: { value: string; label: string }[];
  /** for type 'text' */
  placeholder?: string;
  default: string | boolean;
}

export type ToolOptions = Record<string, string | boolean>;

/** Extra context passed to a tool's transform (options + an optional second input). */
export interface ToolContext {
  options: ToolOptions;
  secondary: string;
}

export interface ToolLogic {
  /** Pure transform. The second arg is ignored by simple single-input tools. */
  transform: (input: string, ctx?: ToolContext) => string;
  /** Optional option controls rendered in the tool toolbar. */
  options?: ToolOption[];
  /** When set, a second input editor is shown (e.g. schema, second document). */
  secondary?: { label: string; placeholder?: string };
}

interface ToolResult {
  output: string;
  error: string | null;
}

export function useToolState(logic: ToolLogic) {
  const [input, setInput] = useState('');
  const [secondary, setSecondary] = useState('');
  const [options, setOptions] = useState<ToolOptions>(() => {
    const init: ToolOptions = {};
    for (const o of logic.options ?? []) init[o.key] = o.default;
    return init;
  });

  const debounced = useDebouncedValue(input, 250);
  const debouncedSecondary = useDebouncedValue(secondary, 250);

  // Output is derived from inputs — computed during render instead of effect + setState.
  const { output, error }: ToolResult = useMemo(() => {
    if (!debounced.trim()) return { output: '', error: null };
    try {
      return {
        output: logic.transform(debounced, { options, secondary: debouncedSecondary }),
        error: null,
      };
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }, [debounced, debouncedSecondary, options, logic]);

  const setOption = (key: string, value: string | boolean) =>
    setOptions((prev) => ({ ...prev, [key]: value }));

  return {
    input, setInput,
    secondary, setSecondary,
    options, setOption,
    optionDefs: logic.options ?? [],
    secondaryDef: logic.secondary,
    output, error,
  };
}
