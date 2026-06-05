import { useMemo, useState } from 'react';
import type { Change } from 'diff';
import { CompareLayout } from '@/components/tool/CompareLayout';
import { DiffViewer } from '@/components/tool/DiffViewer';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { computeXmlDiff } from './logic';

export default function XmlDiff() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const dLeft = useDebouncedValue(left, 250);
  const dRight = useDebouncedValue(right, 250);

  const { parts, error } = useMemo(() => {
    if (!dLeft.trim() || !dRight.trim()) return { parts: [] as Change[], error: null as string | null };
    try {
      return { parts: computeXmlDiff(dLeft, dRight), error: null };
    } catch (e) {
      return { parts: [] as Change[], error: e instanceof Error ? e.message : 'Invalid XML' };
    }
  }, [dLeft, dRight]);

  return (
    <CompareLayout
      error={error}
      left={<CodeEditor value={left} onChange={setLeft} placeholder="<root><a>1</a></root>" minHeight={180} />}
      right={<CodeEditor value={right} onChange={setRight} placeholder="<root><a>2</a></root>" minHeight={180} />}
      result={<DiffViewer parts={parts} />}
    />
  );
}
