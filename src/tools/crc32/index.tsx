import { useToolState } from '@/hooks/useToolState';
import { TwoPaneLayout } from '@/components/tool/TwoPaneLayout';
import { CodeEditor } from '@/components/tool/CodeEditor';
import { CopyButton } from '@/components/tool/CopyButton';
import { crc32Logic } from './logic';

export default function Crc32() {
  const { input, setInput, output, error } = useToolState(crc32Logic);
  return (
    <TwoPaneLayout
      error={error}
      left={<CodeEditor value={input} onChange={setInput} placeholder="Text to checksum…" />}
      right={<CodeEditor value={output} readOnly placeholder="CRC32 appears here…" />}
      actions={<CopyButton text={output} />}
    />
  );
}
