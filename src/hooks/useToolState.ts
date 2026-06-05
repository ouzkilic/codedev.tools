import { useMemo, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

export interface ToolLogic {
  transform: (input: string) => string;
}

interface ToolResult {
  output: string;
  error: string | null;
}

export function useToolState(logic: ToolLogic) {
  const [input, setInput] = useState('');
  const debounced = useDebouncedValue(input, 250);

  // Output is derived from input — computed during render instead of effect + setState.
  const { output, error }: ToolResult = useMemo(() => {
    if (!debounced.trim()) return { output: '', error: null };
    try {
      return { output: logic.transform(debounced), error: null };
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }, [debounced, logic]);

  return { input, setInput, output, error };
}
