import { useMemo, useState } from 'react';
import type { Change } from 'diff';
import { CompareLayout } from '@/components/tool/CompareLayout';
import { DiffViewer } from '@/components/tool/DiffViewer';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { computeHtmlDiff } from './logic';

export default function HtmlDiff() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const dl = useDebouncedValue(left, 250);
  const dr = useDebouncedValue(right, 250);
  const { parts, error } = useMemo(() => {
    if (!dl.trim() || !dr.trim()) return { parts: [] as Change[], error: null as string | null };
    try {
      return { parts: computeHtmlDiff(dl, dr), error: null };
    } catch (e) {
      return { parts: [] as Change[], error: e instanceof Error ? e.message : 'Error' };
    }
  }, [dl, dr]);
  return (
    <CompareLayout
      error={error}
      left={<CodeEditor value={left} onChange={setLeft} placeholder="<a><b>x</b></a>" minHeight={180} />}
      right={<CodeEditor value={right} onChange={setRight} placeholder="<a>\n  <b>x</b>\n</a>" minHeight={180} />}
      result={<DiffViewer parts={parts} />}
    />
  );
}
