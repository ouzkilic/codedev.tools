import { useMemo, useState } from 'react';
import { CompareLayout } from '@/components/tool/CompareLayout';
import { ToolOptions } from '@/components/tool/ToolOptions';
import { DiffViewer } from '@/components/tool/DiffViewer';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ToolOption, ToolOptions as Values } from '@/hooks/useToolState';
import { computeTextDiff, type DiffMode } from './logic';

const OPTION_DEFS: ToolOption[] = [
  {
    key: 'mode',
    label: 'Granularity',
    type: 'select',
    default: 'line',
    choices: [
      { value: 'line', label: 'Line' },
      { value: 'word', label: 'Word' },
      { value: 'char', label: 'Character' },
    ],
  },
  { key: 'ignoreCase', label: 'Ignore case', type: 'toggle', default: false },
  { key: 'ignoreWhitespace', label: 'Ignore whitespace', type: 'toggle', default: false },
];

export default function TextDiff() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [options, setOptions] = useState<Values>({
    mode: 'line',
    ignoreCase: false,
    ignoreWhitespace: false,
  });

  const dLeft = useDebouncedValue(left, 250);
  const dRight = useDebouncedValue(right, 250);
  const mode = String(options.mode) as DiffMode;

  const parts = useMemo(
    () =>
      computeTextDiff(dLeft, dRight, mode, {
        ignoreCase: Boolean(options.ignoreCase),
        ignoreWhitespace: Boolean(options.ignoreWhitespace),
      }),
    [dLeft, dRight, mode, options.ignoreCase, options.ignoreWhitespace],
  );

  const showDiff = dLeft.length > 0 || dRight.length > 0;

  return (
    <CompareLayout
      toolbar={
        <ToolOptions
          defs={OPTION_DEFS}
          values={options}
          onChange={(k, v) => setOptions((o) => ({ ...o, [k]: v }))}
        />
      }
      left={<CodeEditor value={left} onChange={setLeft} placeholder="Original text…" minHeight={180} />}
      right={<CodeEditor value={right} onChange={setRight} placeholder="Changed text…" minHeight={180} />}
      result={showDiff ? <DiffViewer parts={parts} inline={mode !== 'line'} /> : <DiffViewer parts={[]} />}
    />
  );
}
