export function formatExif(data: Record<string, unknown> | undefined | null): string {
  if (!data) return 'No EXIF metadata found.';

  const lines: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    let value: string;
    if (v instanceof Date) {
      value = v.toISOString();
    } else if (v !== null && typeof v === 'object') {
      value = JSON.stringify(v);
    } else {
      value = String(v);
    }
    lines.push(`${k}: ${value}`);
  }

  if (lines.length === 0) return 'No EXIF metadata found.';
  return lines.join('\n');
}
