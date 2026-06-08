import { useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { renderMarkdown } from './logic';

export default function MarkdownPreview() {
  const [input, setInput] = useState('');
  const debounced = useDebouncedValue(input, 200);

  const html = useMemo(() => {
    if (!debounced.trim()) return '';
    return DOMPurify.sanitize(renderMarkdown(debounced));
  }, [debounced]);

  return (
    <TwoPaneLayout
      left={<CodeEditor value={input} onChange={setInput} placeholder={'# Title\n\nSome **markdown**'} />}
      right={
        <div
          className="prose-sm h-full overflow-auto rounded-md border p-4 [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:my-2 [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3"
          style={{ minHeight: 320 }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      }
    />
  );
}
